import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    let text: string;
    let pageCount: number | null = null;

    if (file.type === "application/pdf") {
      const pdfjs = await import("pdfjs-dist");
      const pdf = await pdfjs.getDocument({ data: buffer }).promise;
      pageCount = pdf.numPages;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => ("str" in item ? item.str : ""))
          .join(" ");
        fullText += pageText + "\n";
      }
      text = fullText;
    } else {
      const Tesseract = (await import("tesseract.js")).default;
      const blob = new Blob([buffer], { type: file.type });
      const { data } = await Tesseract.recognize(blob, "eng", { logger: () => {} });
      text = data.text;
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Could not extract text from the document. Please check the file." },
        { status: 422 }
      );
    }

    const { parseReportText } = await import("@/lib/parser");
    const parsed = parseReportText(text);

    if (parsed.results.length === 0) {
      return NextResponse.json(
        { error: "No laboratory results could be extracted. This may not be a valid blood test report." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      ...parsed,
      parsedText: text,
      pageCount,
    });
  } catch (error) {
    console.error("Report processing error:", error);
    return NextResponse.json(
      { error: "Failed to process report. Please try a different file." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, confirmed } = await request.json();
    if (!id || typeof confirmed !== "boolean") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const existing = await prisma.labResult.findFirst({
      where: { id, report: { userId: session.user.id } },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.labResult.update({
      where: { id },
      data: { confirmed, confirmedAt: confirmed ? new Date() : null },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Result update error:", error);
    return NextResponse.json({ error: "Failed to update result" }, { status: 500 });
  }
}
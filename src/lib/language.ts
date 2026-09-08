export interface LanguageHandler {
  code: string;
  label: string;
  matches: (text: string) => boolean;
}

const handlers: LanguageHandler[] = [
  {
    code: "en",
    label: "English",
    matches: (text) =>
      /^[A-Za-z\u00c0-\u017f\s\n()\-.,:;\d%°µ/*=+<>≤≥#\[\]&'"]*$/u.test(text) ||
      /\b(test|value|reference range|result|unit|biomarker|cbc|lipid|glucose)\b/i.test(
        text
      ),
  },
];

export function detectLanguage(text: string): string {
  const sample = text.slice(0, 4000);
  for (const handler of handlers) {
    if (handler.matches(sample)) return handler.code;
  }
  return "unknown";
}

export function getLanguageHandlers(): LanguageHandler[] {
  return handlers;
}
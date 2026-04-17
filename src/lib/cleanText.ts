/**
 * Cleans the transcription text by removing common filler words and trimming.
 */
export function cleanText(text: string): string {
  if (!text) return text;
  return text
    .replace(/\b(um|uh|okay|like)\b/gi, "")
    // Remove double spaces left over by the replacer
    .replace(/\s+/g, ' ')
    .trim();
}

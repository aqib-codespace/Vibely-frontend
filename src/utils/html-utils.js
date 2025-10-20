/**
 * Strips HTML tags from a string
 * @param {string} html - The HTML string to be stripped
 * @returns {string} Plain text without HTML tags
 */
export const stripHtml = (html) => {
  if (typeof html !== "string") return "";
  return html.replace(/<[^>]*>/g, "");
};

/**
 * Highlights search terms in text while preserving formatting
 * @param {string} text - The text to search within
 * @param {string} query - The search query to highlight
 * @returns {React.ReactNode} - Text with highlighted search terms
 */
export const highlightSearchTerms = (text, query) => {
  if (!query || !text) return text;

  // Strip HTML tags before highlighting
  const plainText = stripHtml(text);

  // Split the text by query and map to highlighted parts
  const parts = plainText.split(new RegExp(`(${query})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className="global-search-highlight">
        {part}
      </span>
    ) : (
      part
    )
  );
};

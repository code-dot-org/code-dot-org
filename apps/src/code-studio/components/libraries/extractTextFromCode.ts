/**
 * Extract user-written text from JavaScript code for profanity filtering.
 * This function extracts strings, comments, and identifiers while excluding syntax characters.
 * @param {string} code JavaScript source code
 * @returns {string} Extracted text content separated by spaces
 */
export const extractTextFromCode = (
  code: string | null | undefined
): string => {
  if (!code || typeof code !== 'string') {
    return '';
  }

  const textParts: string[] = [];
  let remainingCode = code;

  // Extract and remove single-line comments
  const singleLineComments = remainingCode.match(/\/\/.*$/gm) || [];
  singleLineComments.forEach(comment => {
    const cleanedComment = comment
      .replace(/^\/\/\s*/, '')
      .replace(/[(){}\[\];,.<>:]/g, ' '); // Remove code syntax that may affect tokenization
    if (cleanedComment.trim()) {
      textParts.push(cleanedComment);
    }
  });
  remainingCode = remainingCode.replace(/\/\/.*$/gm, ' ');

  // Extract and remove multi-line comments
  const multiLineComments = remainingCode.match(/\/\*[\s\S]*?\*\//g) || [];
  multiLineComments.forEach(comment => {
    const cleanedComment = comment
      .replace(/^\/\*\s*|\s*\*\/$/g, '')
      .replace(/\*/g, '')
      .replace(/[(){}\[\];,.<>:]/g, ' '); // Remove code syntax that may affect tokenization
    if (cleanedComment.trim()) {
      textParts.push(cleanedComment);
    }
  });
  remainingCode = remainingCode.replace(/\/\*[\s\S]*?\*\//g, ' ');

  // Extract and remove string literals (single quotes, double quotes, and template literals)
  const stringLiterals =
    remainingCode.match(
      /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g
    ) || [];
  stringLiterals.forEach(str => {
    // Remove quotes and extract content
    const content = str.slice(1, -1);
    // Unescape common escape sequences
    const unescaped = content
      .replace(/\\n/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '');
    // Remove code syntax that affects tokenization (keep *, @, !, _, etc. for obfuscation detection)
    const cleanedString = unescaped.replace(/[(){}\[\];,.<>:]/g, ' ');
    if (cleanedString.trim()) {
      textParts.push(cleanedString);
    }
  });
  remainingCode = remainingCode.replace(
    /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g,
    ' '
  );

  // Extract identifiers (variable names, function names, etc.) from remaining code
  // At least 2 characters long to avoid noise
  // Example: "var x = 1;" would extract only "var" (x is too short, 1 is not an identifier)
  const identifiers =
    remainingCode.match(/\b[a-zA-Z_][a-zA-Z0-9_]{1,}\b/g) || [];

  identifiers.forEach(identifier => {
    if (identifier.trim()) {
      textParts.push(identifier);
    }
  });

  // Join all text parts with spaces and return
  return textParts.join(' ').trim();
};

require 'cld'

#
# A collection of functions to find errors in translations.
#
module TranslationValidator
  # Markdown link should not have space(s) between the [] and () block.
  # E.g. "[text] (url)" is an invalid Markdown link.
  #
  # @param str [String]
  # @return [String, nil] an error message or nil if the input is valid.
  #
  def validate_markdown_link(str)
    return if str.nil? || str.empty?
    str.match?(/\[.*\]\s+\(.*\)/) ? 'cannot have space between [] and () block' : nil
  end

  # Redacted string should not have space(s) between two [] blocks.
  # E.g. "[A] [0]" is invalid but "[A][0] [B][1]" is fine.
  #
  # @param str [String]
  # @return [String, nil] an error message or nil if the input is valid.
  #
  def validate_redacted_blocks(str)
    return if str.nil? || str.empty?
    # delete all valid redacted blocks
    valid_blocks_pattern = /\[\w+\]\[\d+\]/
    remainder = str.gsub(valid_blocks_pattern, '')

    invalid_blocks_pattern = /\[.*\]\s+\[.*\]/
    remainder.match?(invalid_blocks_pattern) ? 'cannot have space between 2 [] blocks' : nil
  end

  # Check if a string is in a certain language.
  #
  # @param str [String]
  # @param language_code [String]
  # @return [String, nil] an error message or nil. Returns nil if the input string
  #   is not in the expected language or if the library could not detect language reliably.
  #
  # @see The supported language codes at https://github.com/google/cld3/blob/master/README.md#supported-languages
  #
  def validate_language(str, language_code)
    # Enforce a minimum string length since language detection is not accurate for short strings.
    return if str.nil? || str.size < 20

    # Ignore 'unknown' language. Also ignore 'en' because of high false-positive rate.
    ignored_language_codes = %w[un en]

    detected_language = CLD.detect_language(str)[:code]
    return if ignored_language_codes.include?(detected_language) || language_code == detected_language
    "language looks like '#{detected_language}' instead of '#{language_code}'"
  end
end

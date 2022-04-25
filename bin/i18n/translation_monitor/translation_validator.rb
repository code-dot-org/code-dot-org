require 'cld'

#
# A collection of functions to find errors in translations.
#
module TranslationValidator
  # Markdown link should not have spaces between the [] and () block.
  # E.g. "[text] (url)" is an invalid Markdown link.
  # @param str [String]
  # @return [String, nil] an error message or nil if the input is valid.
  def validate_markdown_link(str)
    str.match?(/\[\w*\]\s+\(\w*\)/) ? 'cannot have space between [] and () block' : nil
  end

  # Redacted string should not have space(s) between two [] blocks.
  # E.g. "[A] [0]" is invalid but "[A][0] [B][1]" is fine.
  # @param str [String]
  # @return [String, nil] an error message or nil if the input is valid.
  def validate_redacted_blocks(str)
    # delte all valid redacted blocks
    valid_blocks_pattern = /\[\w+\]\[\w+\]/
    remainder = str.gsub(valid_blocks_pattern, '')

    invalid_blocks_pattern = /\[\w+\]\s+\[\w+\]/
    remainder.match?(invalid_blocks_pattern) ? 'cannot have space between 2 [] blocks' : nil
  end

  # Check if a string is in a certain language.
  # @param str [String]
  # @param language_code [String]
  # @return [String, nil] an error message or nil. Returns nil if the input string
  #   is not in the expected language or if the library could not detect language reliably.
  # @see The supported language codes at https://github.com/google/cld3/blob/master/README.md#supported-languages
  def validate_language(str, language_code)
    minimum_string_length = 20
    ignored_language_codes = %w[un en]

    return if str.size < minimum_string_length
    detected_language = CLD.detect_language(str)[:code]
    return if ignored_language_codes.include?(detected_language) || language_code == detected_language
    "language looks like '#{detected_language}' instead of '#{language_code}'"
  end
end

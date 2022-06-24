require 'cld'

#
# A collection of functions to find errors in translations.
#
module CoreValidator
  # Markdown link should not have space(s) between the [] and () block.
  # E.g. "[text] (url)" is an invalid Markdown link.
  #
  # @param str [String]
  # @return [String, nil] an error message or nil if the input is valid.
  #
  def validate_markdown_link(str)
    return if str.nil? || str.empty?
    remainder = remove_valid_redacted_blocks(str)
    remainder.match?(/\[.*\]\s+\(.*\)/) ? 'cannot have space between [] and () block' : nil
  end

  # Redacted string should not have space(s) between two [] blocks.
  # E.g. "[A] [0]" is invalid but "[A][0] [B][1]" is fine.
  #
  # @param str [String]
  # @return [String, nil] an error message or nil if the input is valid.
  #
  def validate_redacted_blocks(str)
    return if str.nil? || str.empty?
    remainder = remove_valid_redacted_blocks(str)
    invalid_blocks_pattern = /\[.*\]\s+\[.*\]/
    remainder.match?(invalid_blocks_pattern) ? 'cannot have space between 2 [] blocks' : nil
  end

  def remove_valid_redacted_blocks(str)
    # A valid redacted blocks could be [][0] or [something][0] or [another thing][0]
    valid_blocks_pattern = /\[[\w\s]*\]\[\d+\]/
    str.gsub(valid_blocks_pattern, '')
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
    return if str.nil? || count_words(str) < 5

    # Ignore 'unknown' language. Also ignore 'en' because of high false-positive rate.
    ignored_language_codes = %w[un en xxx]

    detected_language = CLD.detect_language(str)[:code]
    return if ignored_language_codes.include?(detected_language) || language_code == detected_language
    "language looks like '#{detected_language}' instead of '#{language_code}'"
  end

  def count_words(str)
    str.strip.split(/\s+/).size
  end
end

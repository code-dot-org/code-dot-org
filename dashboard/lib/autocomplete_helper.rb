class AutocompleteHelper
  # The minimum word length.
  MIN_WORD_LENGTH = 3

  # The lower bound limit value.
  MIN_LIMIT = 1

  # The upper bound limit value.
  MAX_LIMIT = 40

  # Bounds the limit by the mininum and maximum allowed range.
  # @param limit [Integer] The specified limit.
  # @return [Integer] The bounded limit.
  def self.format_limit(limit)
    return [MIN_LIMIT, [limit.to_i, MAX_LIMIT].min].max
  end

  def self.get_query_terms(query)
    query.strip.split(/\s+/).map do |w|
      w.gsub(/\W/, '').upcase.presence
    end.compact
  end

  # Formats the query string for boolean full-text search.
  # For instance, if the user-defined query string is 'abc def',
  # the string is reformatted to '+ABC +DEF*'.
  # Strings shorter than 3 characters aren't indexed so those are filtered out.
  # @see https://dev.mysql.com/doc/refman/5.6/en/fulltext-boolean.html
  # @param query [String] the user-defined query string
  # @return [String] the formatted query string
  def self.format_query(query)
    words = get_query_terms query
    # Don't filter the last word if it is short since we will
    # append it with * for a wildcard search.
    words = words.select.with_index do |w, i|
      i == words.length - 1 || w.length >= MIN_WORD_LENGTH
    end

    return words.empty? ? "" : "+#{words.join(' +')}*"
  end
end

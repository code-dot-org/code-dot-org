class ResourcesAutocomplete < AutocompleteHelper
  def self.get_search_matches(query, limit)
    limit = format_limit(limit)

    rows = Resource.limit(limit)
    query = format_query(query)
    return [] if query.length < MIN_WORD_LENGTH + 2
    rows = rows.
      where("MATCH(name,url) AGAINST(? in BOOLEAN MODE)", query)
    return rows.map(&:attributes)
  end
end

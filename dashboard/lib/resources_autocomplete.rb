class ResourcesAutocomplete < AutocompleteHelper
  def self.get_search_matches(query, limit)
    limit = format_limit(limit)

    rows = Resource.limit(limit)
    return [] if query.length < MIN_WORD_LENGTH
    query = format_query(query)
    rows = rows.
      where("MATCH(name,url) AGAINST(? in BOOLEAN MODE)", query)
    return rows.map(&:attributes)
  end
end

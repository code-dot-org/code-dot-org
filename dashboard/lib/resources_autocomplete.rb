class ResourcesAutocomplete < AutocompleteHelper
  def self.get_search_matches(query, limit, course_version_id)
    limit = format_limit(limit)

    rows = Resource.limit(limit)
    if course_version_id
      puts course_version_id
      rows = rows.where(course_version_id: course_version_id)
    end
    return [] if query.length < MIN_WORD_LENGTH
    query = format_query(query)
    rows = rows.
      where("MATCH(name,url) AGAINST(? in BOOLEAN MODE)", query)
    return rows.map(&:attributes)
  end
end

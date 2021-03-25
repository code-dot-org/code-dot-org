class StandardsAutocomplete < AutocompleteHelper
  def self.get_search_matches(query, limit, framework_id)
    query = format_query(query)
    return [] if query.length < MIN_WORD_LENGTH

    limit = format_limit(limit)
    rows = Standard.limit(limit)
    rows = rows.where(framework_id: framework_id) if framework_id

    rows = rows.
      where("MATCH(shortcode,description) AGAINST(? in BOOLEAN MODE)", query)
    return rows.map(&:summarize_for_lesson_edit)
  end
end

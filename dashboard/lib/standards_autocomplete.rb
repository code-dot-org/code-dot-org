class StandardsAutocomplete < AutocompleteHelper
  def self.get_search_matches(query, limit, framework_id = nil)
    limit = format_limit(limit)
    rows = Standard.limit(limit)
    rows = rows.where(framework_id: framework_id) if framework_id

    shortcode_rows = rows.where('shortcode like ?', "#{query}%").all
    return shortcode_rows.map(&:summarize_for_lesson_edit) unless shortcode_rows.empty?

    return [] if query.length < MIN_WORD_LENGTH

    description_rows = rows.where(
      'MATCH(description) AGAINST(? in BOOLEAN MODE)',
      format_query(query)
    )
    return description_rows.map(&:summarize_for_lesson_edit)
  end
end

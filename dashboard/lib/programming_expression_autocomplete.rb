class ProgrammingExpressionAutocomplete < AutocompleteHelper
  def self.get_search_matches(query, limit)
    limit = format_limit(limit)

    rows = ProgrammingExpression.limit(limit)
    return [] if query.length < MIN_WORD_LENGTH
    query = format_query(query)
    rows = rows.
        where("MATCH(name,programming_environment_id) AGAINST(? in BOOLEAN MODE)", query)
    return rows.map(&:summarize_for_lesson_edit)
  end
end

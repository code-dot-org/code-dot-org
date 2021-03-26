class ProgrammingExpressionAutocomplete < AutocompleteHelper
  def self.get_search_matches(query, limit, programming_environment)
    query = format_query(query)
    return [] if query.length < MIN_WORD_LENGTH

    limit = format_limit(limit)
    rows = ProgrammingExpression.limit(limit)
    rows = rows.where(programming_environment: programming_environment) if programming_environment

    rows = rows.
        where("MATCH(name,category) AGAINST(? in BOOLEAN MODE)", query)
    return rows.map(&:summarize_for_lesson_edit)
  end
end

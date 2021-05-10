class ProgrammingExpressionAutocomplete < AutocompleteHelper
  def self.get_search_matches(page, query, programming_environment)
    query = format_query(query)
    return [] if query.length < MIN_WORD_LENGTH

    rows = ProgrammingExpression.all
    rows = rows.where(programming_environment: programming_environment) if programming_environment

    rows = rows.
        where("MATCH(name,category) AGAINST(? in BOOLEAN MODE)", query)

    rows = rows.limit(100)
    total_rows = rows.length
    page_number = (total_rows / 10.0).ceil
    rows = rows.page(page).per(10)

    return {programmingExpressions: rows.map(&:summarize_for_lesson_edit), numPages: page_number}
  end
end

class ProgrammingExpressionAutocomplete < AutocompleteHelper
  def self.get_search_matches(page, query, programming_environment)
    query ||= ''
    return [] if query.strip.length < MIN_WORD_LENGTH
    terms = get_query_terms(query)

    rows = ProgrammingExpression.all
    rows = rows.where(programming_environment: programming_environment) if programming_environment

    terms.each do |term|
      rows = rows.
        where("name LIKE ? OR category LIKE ?", "%#{term}%", "%#{term}%")
    end

    rows = rows.limit(100)
    total_rows = rows.length
    page_number = (total_rows / 10.0).ceil
    rows = rows.page(page).per(10)

    return {programmingExpressions: rows.map(&:summarize_for_lesson_edit), numPages: page_number}
  end
end

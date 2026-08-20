class QuizQuestionAutocomplete < AutocompleteHelper
  # Question bank search - see LevelsController#index_quiz_questions. Unlike
  # VocabularyAutocomplete/ResourcesAutocomplete, an empty query isn't
  # rejected: it means "browse the bank" rather than "search the bank," so
  # it returns questions unfiltered instead of [].
  #
  # Higher ceiling than the shared AutocompleteHelper::MAX_LIMIT (40) - this
  # backs a scrollable browse list, not a type-ahead dropdown, so a larger
  # page is reasonable.
  MAX_LIMIT = 80

  # sort: 'name' for alphabetical by question_name, anything else (including
  # unset) for most-recently-created first. A levelbuilder-facing toggle -
  # see QuizQuestionBank.tsx - not a query param exposed to end users.
  SORT_ORDERS = {
    'name' => {question_name: :asc},
    'recent' => {created_at: :desc}
  }.freeze

  def self.get_search_matches(query, limit, sort = nil)
    limit = limit.to_i.clamp(MIN_LIMIT, MAX_LIMIT)
    order = SORT_ORDERS.fetch(sort, SORT_ORDERS['recent'])
    rows = MultipleChoiceQuestion.order(order).limit(limit)
    return rows if query.blank?
    return MultipleChoiceQuestion.none if query.length < MIN_WORD_LENGTH

    rows.where("MATCH(question_name) AGAINST(? IN BOOLEAN MODE)", format_query(query))
  end
end

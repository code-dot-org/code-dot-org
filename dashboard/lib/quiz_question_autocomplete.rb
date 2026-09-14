class QuizQuestionAutocomplete < AutocompleteHelper
  # Question bank search - see QuizQuestionsController#index. Unlike
  # VocabularyAutocomplete/ResourcesAutocomplete, an empty query isn't
  # rejected: it means "browse the bank" rather than "search the bank," so
  # it returns questions unfiltered instead of [].
  #
  # Higher ceiling than the shared AutocompleteHelper::MAX_LIMIT (40) - this
  # backs a scrollable browse list, not a type-ahead dropdown, so a larger
  # page is reasonable.
  MAX_LIMIT = 80

  # sort: 'name' for alphabetical by name, anything else (including unset)
  # for most-recently-created first.
  SORT_ORDERS = {
    'name' => {name: :asc},
    'recent' => {created_at: :desc}
  }.freeze

  # standard_id, if given, narrows to questions tagged with that Standard
  # (AND'd with the name search below, not an alternative to it). Resolving
  # a frontend-facing (frameworkShortcode, shortcode) pair into this id is
  # the caller's job - see QuizQuestionsController#find_standard.
  #
  # course_or_unit, if given, is {type: 'course' or 'unit', id:} and narrows
  # to questions used (via some quiz) in that course/unit - also AND'd, not
  # an alternative.
  def self.get_search_matches(query, limit, sort = nil, standard_id = nil, course_or_unit = nil)
    limit = limit.to_i.clamp(MIN_LIMIT, MAX_LIMIT)
    order = SORT_ORDERS.fetch(sort, SORT_ORDERS['recent'])
    rows = MultipleChoiceQuestion.order(order).limit(limit)
    rows = rows.joins(:standards).where(standards: {id: standard_id}) if standard_id
    rows = apply_course_or_unit_filter(rows, course_or_unit) if course_or_unit
    return rows if query.blank?
    return MultipleChoiceQuestion.none if query.length < MIN_WORD_LENGTH

    rows.where("MATCH(name) AGAINST(? IN BOOLEAN MODE)", format_query(query))
  end

  # A question can be attached (via QuizQuestionPlacement) to more than one
  # Quiz, and a Quiz's own script_levels can span more than one Unit, so the
  # joins below can multiply rows - .distinct collapses those back down to
  # one row per matching question, same as .limit above still expects.
  private_class_method def self.apply_course_or_unit_filter(rows, course_or_unit)
    case course_or_unit[:type]
    when 'unit'
      rows.joins(levels: :script_levels).where(script_levels: {script_id: course_or_unit[:id]}).distinct
    when 'course'
      rows.joins(levels: {script_levels: {script: :unit_groups}}).where(unit_groups: {id: course_or_unit[:id]}).distinct
    else
      rows
    end
  end
end

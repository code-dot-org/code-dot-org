# Shared by QuizQuestionsController and QuizQuestionPlacementsController.
# both need to render a QuizQuestion the same way, and both
# accept the same create/update params.
module QuizQuestionSerialization
  extend ActiveSupport::Concern

  # Placeholder default for quiz_question_json's precomputed-value keyword
  # args, distinguishing "not given, compute it for this one question"
  # from a real value that happens to be false/nil (e.g. an unattached
  # question's page, or a question not used anywhere else).
  UNSET = Object.new.freeze

  # Only allow the allow-list through.
  private def quiz_question_params
    params.permit(
      :questionName, :stem, :correctChoiceId, :explanation, :page, :editMode,
      choices: [:id, :text],
      standards: [:frameworkShortcode, :shortcode]
    )
  end

  # (frameworkShortcode, shortcode) is how a Standard is identified across
  # this codebase's request/response boundary - see LessonsController's own
  # fetch_standards and Standard#summarize_for_lesson_edit.
  private def fetch_quiz_question_standards(standards_data)
    (standards_data || []).map {|s| find_standard(s['frameworkShortcode'], s['shortcode'])}
  end

  # Returns nil, rather than raising, when framework_shortcode is blank -
  # both callers treat "no standard specified" as a legitimate, common case
  # (index with no standard filter; a question tagged with nothing). A
  # present but unresolvable shortcode still raises
  # ActiveRecord::RecordNotFound.
  private def find_standard(framework_shortcode, shortcode)
    return nil if framework_shortcode.blank?

    framework = Framework.find_by!(shortcode: framework_shortcode)
    Standard.find_by!(framework: framework, shortcode: shortcode)
  end

  # Resolves index's courseOrUnitType/courseOrUnitId params into the {type, id}
  # shape QuizQuestionAutocomplete.get_search_matches expects. nil, not raising,
  # when type is blank. A present but unresolvable id still raises
  # ActiveRecord::RecordNotFound, caught by index's rescue.
  private def find_course_or_unit(type, id)
    return nil if type.blank?

    case type
    when 'unit'
      {type: 'unit', id: Unit.find(id).id}
    when 'course'
      {type: 'course', id: UnitGroup.find(id).id}
    else
      raise ActiveRecord::RecordNotFound, "unrecognized courseOrUnitType #{type}"
    end
  end

  # level: nil is a legitimate case here - QuizQuestionsController renders a
  # bank question independent of any one quiz.
  # The three keyword args let a caller pass in values it already computed
  # for a whole page in bulk (see QuizQuestionsController#index) instead of
  # this running a fresh query per question - single-question callers
  # (create/show/update/attach) only ever serialize one, so the per-question
  # query each falls back to here is fine.
  private def quiz_question_json(question, level: nil, attached_to_other_quizzes: UNSET, used_in_published_unit: UNSET, page: UNSET)
    {
      id: question.id,
      type: question.type,
      questionName: question.name,
      stem: question.content['stem'],
      choices: question.content['choices'],
      correctChoiceId: question.content['correct_choice_id'],
      explanation: question.explanation,
      standards: question.standards.map(&:summarize_for_lesson_edit),
      attachedToOtherQuizzes:
        if attached_to_other_quizzes.equal?(UNSET)
          level ? question.levels.where.not(id: level.id).exists? : question.levels.exists?
        else
          attached_to_other_quizzes
        end,
      usedInPublishedUnit: used_in_published_unit.equal?(UNSET) ? question.used_in_published_unit? : used_in_published_unit,
      page: page.equal?(UNSET) ? level&.placements&.find_by(quiz_question_id: question.id)&.page : page,
    }
  end
end

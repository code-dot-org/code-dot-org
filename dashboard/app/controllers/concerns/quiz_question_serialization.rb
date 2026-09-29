# Shared by QuizQuestionsController and QuizQuestionPlacementsController: both
# render a QuizQuestion the same way and take the same create/update params.
module QuizQuestionSerialization
  extend ActiveSupport::Concern

  # Distinguishes "not given, compute it" from a real false/nil value.
  UNSET = Object.new.freeze

  private def quiz_question_params
    params.permit(
      :questionName, :stem, :correctChoiceId, :explanation, :page, :editMode,
      choices: [:id, :text],
      standards: [:frameworkShortcode, :shortcode]
    )
  end

  # (frameworkShortcode, shortcode) is how a Standard crosses the
  # request/response boundary - see LessonsController#fetch_standards.
  private def fetch_quiz_question_standards(standards_data)
    (standards_data || []).map {|s| find_standard(s['frameworkShortcode'], s['shortcode'])}
  end

  # nil, not raising, when no standard was specified - a common case for both
  # callers.
  private def find_standard(framework_shortcode, shortcode)
    return nil if framework_shortcode.blank?

    framework = Framework.find_by!(shortcode: framework_shortcode)
    Standard.find_by!(framework: framework, shortcode: shortcode)
  end

  # Resolves index's courseOrUnitType/courseOrUnitId into the {type, id} shape
  # QuizQuestionAutocomplete.get_search_matches expects.
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

  # level: nil is legitimate - QuizQuestionsController renders a bank question
  # independent of any one quiz. The keyword args let a bulk caller (index) pass
  # values it already computed instead of a query per question.
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

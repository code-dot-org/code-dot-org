# Levelbuilder-only management of the QuizQuestion bank itself, addressed
# by the question's own stable id - independent of any one quiz.
class QuizQuestionsController < ApplicationController
  include QuizQuestionSerialization

  before_action :authenticate_user!
  before_action :require_levelbuilder_mode_or_test_env
  before_action {authorize! :manage, QuizQuestion}

  # GET /quiz_questions?quizLevelId=&search=&sort=&standardFrameworkShortcode=&standardShortcode=&courseOrUnitType=&courseOrUnitId=
  #
  # Question bank browsing: matches by name, marks each attached: true/false
  # (and its page) relative to quizLevelId - required, since nothing yet
  # browses the bank standalone. sort: 'name' or 'recent' (default).
  # Standard/course/unit params further narrow results, AND'd with search.
  def index
    level = find_quiz_level(params[:quizLevelId], required: true)
    standard = find_standard(params[:standardFrameworkShortcode], params[:standardShortcode])
    course_or_unit = find_course_or_unit(params[:courseOrUnitType], params[:courseOrUnitId])
    questions = QuizQuestionAutocomplete.get_search_matches(params[:search], params[:limit], params[:sort], standard&.id, course_or_unit).
      includes(standards: [:framework, {category: :parent_category}])
    attached_ids = level.questions.pluck(:id).to_set

    # Precomputed once for the whole page, rather than per row.
    question_ids = questions.map(&:id)
    # reorder(nil) drops QuizQuestionPlacement's own default_scope order
    # (page, position) - MySQL rejects DISTINCT combined with an ORDER BY
    # on columns outside the SELECT list, and page/position are irrelevant
    # to a plain distinct id list anyway.
    other_quiz_ids = QuizQuestionPlacement.where(quiz_question_id: question_ids).where.not(level_id: level.id).
      reorder(nil).distinct.pluck(:quiz_question_id).to_set
    published_usage = QuizQuestion.published_unit_usage(question_ids)
    pages_by_question_id = level.placements.where(quiz_question_id: question_ids).pluck(:quiz_question_id, :page).to_h

    result = questions.map do |question|
      quiz_question_json(
        question,
        level: level,
        attached_to_other_quizzes: other_quiz_ids.include?(question.id),
        used_in_published_unit: published_usage.fetch(question.id, false),
        page: pages_by_question_id[question.id]
      ).merge(attached: attached_ids.include?(question.id))
    end
    render json: result
  rescue ActiveRecord::RecordNotFound
    render json: []
  end

  # GET /quiz_questions/course_unit_search?query=
  #
  # Combined course/unit typeahead backing the question bank's course/unit
  # filter. A plain name substring match, not the
  # MATCH/AGAINST fulltext convention used elsewhere in this file - course
  # and unit names are short, and neither table carries a FULLTEXT index.
  def course_unit_search
    query = params[:query].to_s.strip
    return render json: [] if query.length < AutocompleteHelper::MIN_WORD_LENGTH

    # sanitize_sql_like escapes % and _ - unescaped, either would keep its
    # SQL wildcard meaning even though query itself is parameterized, so
    # e.g. "_" would match any single character instead of a literal
    # underscore.
    sanitized = ActiveRecord::Base.sanitize_sql_like(query)
    units = Unit.where('name LIKE ?', "%#{sanitized}%").order(:name).limit(10)
    courses = UnitGroup.where('name LIKE ?', "%#{sanitized}%").order(:name).limit(10)

    render json:
      units.map {|u| {type: 'unit', id: u.id, name: u.name}} +
        courses.map {|c| {type: 'course', id: c.id, name: c.name}}
  end

  # GET /quiz_questions/:id
  #
  # Building-only counterpart to Quiz#summarize_for_lab2_properties, which
  # excludes correct_choice_id. Any bank question, regardless of which quiz
  # (if any) has it placed.
  def show
    question = QuizQuestion.find(params[:id])
    render json: quiz_question_json(question)
  end

  # PUT /quiz_questions/:id?quizLevelId=
  #
  # Assumes MultipleChoiceQuestion-shaped params, same as
  # QuizQuestionPlacementsController#create. only MultipleChoiceQuestion
  # rows exist for now. TODO: Implement other question types.
  #
  # quizLevelId, if given, is the quiz whose placement of this question
  # should be repointed at the fork when should_fork is true.
  # editMode: 'fork' requests a fork explicitly (offered by the frontend
  # only when the question is attached to some other quiz too, with nothing
  # forcing the choice) - never trusted alone though. used_in_published_unit?
  # forces a fork. Forking never touches the original row or any other
  # quiz's placement of it - it only repoints quizLevelId's own
  # QuizQuestionPlacement (if any) at a brand new question carrying the
  # edited content.
  def update
    question = QuizQuestion.find(params[:id])
    level = find_quiz_level(params[:quizLevelId])
    placement = level&.placements&.find_by!(quiz_question_id: question.id)
    should_fork = question.used_in_published_unit? || quiz_question_params[:editMode] == 'fork'
    target = should_fork ? MultipleChoiceQuestion.new(key: SecureRandom.uuid, parent: question) : question

    ActiveRecord::Base.transaction(requires_new: true) do
      target.update!(
        name: quiz_question_params[:questionName],
        content: {
          stem: quiz_question_params[:stem],
          choices: (quiz_question_params[:choices] || []).map(&:to_h),
          correct_choice_id: quiz_question_params[:correctChoiceId],
        },
        explanation: quiz_question_params[:explanation]
      )
      target.standards = fetch_quiz_question_standards(quiz_question_params[:standards])

      if placement
        placement.quiz_question = target if should_fork
        placement.page = quiz_question_params[:page] if quiz_question_params[:page].present?
        placement.save!
      end
    end

    render json: quiz_question_json(target, level: level)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # Resolves a quizLevelId param into its Quiz, or nil when the param is
  # blank. A present but unresolvable, or non-Quiz, id still raises
  # ActiveRecord::RecordNotFound.
  private def find_quiz_level(id, required: false)
    if id.blank?
      raise ActiveRecord::RecordNotFound if required
      return nil
    end

    level = Level.find(id)
    raise ActiveRecord::RecordNotFound unless level.is_a?(Quiz)
    level
  end
end

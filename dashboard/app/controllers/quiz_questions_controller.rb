# Levelbuilder-only CRUD for the QuizQuestion bank, addressed by the
# question's own id.
class QuizQuestionsController < ApplicationController
  include QuizQuestionSerialization

  before_action :authenticate_user!
  before_action :require_levelbuilder_mode_or_test_env
  before_action {authorize! :manage, QuizQuestion}

  # GET /quiz_questions?quizLevelId=&search=&sort=&standardFrameworkShortcode=&standardShortcode=&courseOrUnitType=&courseOrUnitId=
  #
  # Question bank browsing, scoped to quizLevelId (required). sort: 'name'
  # or 'recent' (default).
  def index
    level = find_quiz_level(params[:quizLevelId], required: true)
    standard = find_standard(params[:standardFrameworkShortcode], params[:standardShortcode])
    course_or_unit = find_course_or_unit(params[:courseOrUnitType], params[:courseOrUnitId])
    questions = QuizQuestionAutocomplete.get_search_matches(params[:search], params[:limit], params[:sort], standard&.id, course_or_unit).
      includes(standards: [:framework, {category: :parent_category}])
    attached_ids = level.questions.pluck(:id).to_set

    # Precomputed once for the whole page, rather than per row.
    question_ids = questions.map(&:id)
    # reorder(nil) - MySQL rejects DISTINCT with ORDER BY on unselected columns.
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
  # Course/unit typeahead. Plain substring match, not fulltext - no
  # FULLTEXT index on these tables.
  def course_unit_search
    query = params[:query].to_s.strip
    return render json: [] if query.length < AutocompleteHelper::MIN_WORD_LENGTH

    # Escapes % and _ so they match literally, not as SQL wildcards.
    sanitized = ActiveRecord::Base.sanitize_sql_like(query)
    units = Unit.where('name LIKE ?', "%#{sanitized}%").order(:name).limit(10)
    courses = UnitGroup.where('name LIKE ?', "%#{sanitized}%").order(:name).limit(10)

    render json:
      units.map {|u| {type: 'unit', id: u.id, name: u.name}} +
        courses.map {|c| {type: 'course', id: c.id, name: c.name}}
  end

  # GET /quiz_questions/:id
  #
  # Any bank question, regardless of which quiz (if any) has it placed.
  def show
    question = QuizQuestion.find(params[:id])
    render json: quiz_question_json(question)
  end

  # PUT /quiz_questions/:id?quizLevelId=
  #
  # MultipleChoiceQuestion-shaped params. TODO: other question types.
  #
  # quizLevelId's placement gets repointed at the fork, if any. editMode:
  # 'fork' forces a fork explicitly; used_in_published_unit? also forces one.
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

  # Resolves quizLevelId into its Quiz, or nil if blank.
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

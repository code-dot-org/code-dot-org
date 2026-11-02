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
  # Content params follow the type param, or the question's own type if
  # none is given. Only choice types can switch, to each other.
  #
  # quizLevelId's placement gets repointed at the fork, if any. editMode:
  # 'fork' forces a fork explicitly; used_in_published_unit? and a type
  # change also force one. A type change then deletes the original if
  # nothing else references it.
  def update
    question = QuizQuestion.find(params[:id])
    level = find_quiz_level(params[:quizLevelId])
    placement = level&.placements&.find_by!(quiz_question_id: question.id)
    target_class = quiz_question_params[:type].present? ? quiz_question_class : question.class
    type_changed = target_class != question.class
    if type_changed
      unless question.is_a?(ChoiceQuestion) && target_class.include?(ChoiceQuestion)
        raise ArgumentError, "a #{question.type} can't become a #{target_class.name}"
      end
      raise ArgumentError, 'changing type requires quizLevelId' unless placement
    end
    should_fork = type_changed || question.used_in_published_unit? || quiz_question_params[:editMode] == 'fork'
    target = should_fork ? target_class.new(key: SecureRandom.uuid, fork_parent: question) : question

    ActiveRecord::Base.transaction(requires_new: true) do
      target.update!(
        name: quiz_question_params[:questionName],
        content: target_class.content_from_builder_params(quiz_question_params),
        explanation: quiz_question_params[:explanation]
      )

      target.standards =
        if quiz_question_params.key?(:standards)
          fetch_quiz_question_standards(quiz_question_params[:standards])
        else
          question.standards
        end

      if placement
        placement.quiz_question = target if should_fork
        placement.page = quiz_question_params[:page] if quiz_question_params[:page].present?
        placement.save!
      end

      question.destroy! if type_changed && !question.referenced?
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

# Levelbuilder-only CRUD for a Quiz's question bank
class QuizQuestionsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_levelbuilder_mode_or_test_env
  before_action {@level = Level.find(params[:level_id])}
  before_action {authorize! :manage, @level}
  before_action :require_quiz_level, except: [:course_unit_search]

  # GET /levels/:level_id/quiz_questions?search=&sort=&standardFrameworkShortcode=&standardShortcode=&courseOrUnitType=&courseOrUnitId=
  #
  # Question bank browsing: matches by name, marks each attached: true/false
  # for this quiz. sort is 'name' or 'recent' (default) - see
  # QuizQuestionAutocomplete::SORT_ORDERS). standardFrameworkShortCode/
  # standardShortcode and courseOrUnitType/courseOrUnitId, if given,
  # further narrow results (AND'd with search, not exclusive of it).
  def index
    standard = find_standard(params[:standardFrameworkShortcode], params[:standardShortcode])
    course_or_unit = find_course_or_unit(params[:courseOrUnitType], params[:courseOrUnitId])
    questions = QuizQuestionAutocomplete.get_search_matches(params[:search], params[:limit], params[:sort], standard&.id, course_or_unit)
    attached_ids = @level.questions.pluck(:id)

    render json: questions.map {|question| quiz_question_json(question).merge(attached: attached_ids.include?(question.id))}
  rescue ActiveRecord::RecordNotFound
    render json: []
  end

  # GET /levels/:level_id/quiz_questions/course_unit_search?query=
  #
  # Combined course/unit typeahead backing the question bank's course/unit
  # filter. A plain name substring match, not the
  # MATCH/AGAINST fulltext convention used elsewhere in this file - course
  # and unit names are short, and neither table carries a FULLTEXT index.
  def course_unit_search
    query = params[:query].to_s.strip
    return render json: [] if query.length < AutocompleteHelper::MIN_WORD_LENGTH

    units = Unit.where('name LIKE ?', "%#{query}%").order(:name).limit(10)
    courses = UnitGroup.where('name LIKE ?', "%#{query}%").order(:name).limit(10)

    render json:
      units.map {|u| {type: 'unit', id: u.id, name: u.name}} +
        courses.map {|c| {type: 'course', id: c.id, name: c.name}}
  end

  # GET /levels/:level_id/quiz_questions/:id
  #
  # Building-only counterpart to Quiz#summarize_for_lab2_properties: that
  # method deliberately excludes correct_choice_id, so editing an existing question's
  # answer needs its own fetch instead of reusing levelProperties.quizQuestions.
  def show
    question = @level.questions.find(params[:id])
    render json: quiz_question_json(question)
  end

  # POST /levels/:level_id/quiz_questions
  #
  # Creates a MultipleChoiceQuestion and attaches it to this Quiz level.
  # TODO: Implement other question types.
  def create
    question = MultipleChoiceQuestion.create!(
      key: SecureRandom.uuid,
      name: quiz_question_params[:questionName],
      content: {
        stem: quiz_question_params[:stem],
        choices: (quiz_question_params[:choices] || []).map(&:to_h),
        correct_choice_id: quiz_question_params[:correctChoiceId],
      },
      explanation: quiz_question_params[:explanation]
    )
    question.standards = fetch_quiz_question_standards(quiz_question_params[:standards])
    next_position = (@level.placements.maximum(:position) || 0) + 1
    QuizQuestionPlacement.create!(
      level: @level, quiz_question: question,
      page: quiz_question_params[:page].presence || 1, position: next_position
    )

    render status: :created, json: quiz_question_json(question)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # PUT /levels/:level_id/quiz_questions/:id
  #
  # Assumes MultipleChoiceQuestion-shaped params, same as create.
  # only MultipleChoiceQuestion rows exist for now.
  # TODO: Implement other question types.
  #
  # editMode: 'fork' requests a fork explicitly (offered by the frontend
  # only when the question is attached to some other quiz too, with nothing
  # forcing the choice) - never trusted alone though. used_in_published_unit?
  # forces a fork. Forking never touches the original row or any other
  # quiz's placement of it - it only repoints this quiz's own
  # QuizQuestionPlacement at a brand new question carrying the edited content.
  def update
    question = @level.questions.find(params[:id])
    placement = @level.placements.find_by!(quiz_question_id: question.id)
    should_fork = question.used_in_published_unit? || quiz_question_params[:editMode] == 'fork'
    target = should_fork ? MultipleChoiceQuestion.new(key: SecureRandom.uuid, parent: question) : question

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

    placement.quiz_question = target if should_fork
    placement.page = quiz_question_params[:page] if quiz_question_params[:page].present?
    placement.save!

    render json: quiz_question_json(target)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # POST /levels/:level_id/quiz_questions/:id/attach
  #
  # Attaches an existing bank question to this quiz - unlike create, this
  # never creates a new QuizQuestion row, only a new QuizQuestionPlacement.
  # find_or_create_by! makes this idempotent against a double click (adding
  # twice would otherwise be a silent no-op anyway, but this avoids a
  # spurious duplicate row/error).
  def attach
    question = MultipleChoiceQuestion.find(params[:id])
    next_position = (@level.placements.maximum(:position) || 0) + 1
    QuizQuestionPlacement.find_or_create_by!(level: @level, quiz_question: question) do |placement|
      placement.page = 1
      placement.position = next_position
    end

    render status: :created, json: quiz_question_json(question)
  rescue StandardError => exception
    render status: :bad_request, json: {error: exception.message}
  end

  # DELETE /levels/:level_id/quiz_questions/:id/detach
  #
  # Removes the question from this quiz only - destroys the
  # QuizQuestionPlacement, leaves the QuizQuestion itself untouched.
  def detach
    @level.placements.find_by!(quiz_question_id: params[:id]).destroy!

    head :no_content
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  # DELETE /levels/:level_id/quiz_questions/:id
  #
  # Removes the question from this quiz AND destroys the QuizQuestion
  # itself, provided it's not attached to any other quiz once detached.
  # "unused elsewhere" is re-checked here rather than trusted from the
  # client's earlier attachedToOtherQuizzes read (see quiz_question_json) -
  # a stale read can't accidentally delete a question another quiz picked up
  # in the meantime, so this falls back to a plain detach in that case.
  def destroy
    placement = @level.placements.find_by!(quiz_question_id: params[:id])
    question = placement.quiz_question
    placement.destroy!

    destroyed = !question.levels.exists?
    question.destroy! if destroyed

    # destroyed tells the caller whether this fell back to a plain detach
    # (another quiz grabbed the question between the frontend's last
    # attachedToOtherQuizzes read and this request) - QuizQuestionBank needs
    # to know that to decide whether the question should disappear from its
    # results or just remain there, still attachable.
    render json: {destroyed: destroyed}
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  private def require_quiz_level
    head :not_found unless @level.is_a?(Quiz)
  end

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

  # Resolves index's courseOrUnitType/courseOrUnitId params (as picked from
  # course_unit_search's results) into the {type, id} shape
  # QuizQuestionAutocomplete.get_search_matches expects. nil, not raising,
  # when type is blank - "no course/unit filter" is the common case, same
  # as find_standard above. A present but unresolvable id still raises
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

  # Shared by create/show/update.
  private def quiz_question_json(question)
    {
      id: question.id,
      type: question.type,
      questionName: question.name,
      stem: question.content['stem'],
      choices: question.content['choices'],
      correctChoiceId: question.content['correct_choice_id'],
      explanation: question.explanation,
      standards: question.standards.map(&:summarize_for_lesson_edit),
      attachedToOtherQuizzes: question.levels.where.not(id: @level.id).exists?,
      usedInPublishedUnit: question.used_in_published_unit?,
      # nil for a bank question not (yet) attached to @level - page only
      # means something in the context of a specific quiz's own placement.
      page: @level.placements.find_by(quiz_question_id: question.id)&.page,
    }
  end
end

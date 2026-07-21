class PracticeProblemsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource only: [:index, :show]
  before_action :require_levelbuilder_mode_or_test_env, only: [:create, :update, :destroy, :generate]
  authorize_resource only: [:create, :update, :destroy, :generate]

  # GET /practice_problems
  def index
    problems = params[:objective_ids].present? ?
      @practice_problems.joins(:objectives).where(objectives: {id: params[:objective_ids]}).distinct :
      @practice_problems
    render json: problems&.map(&:summarize)
  end

  # GET /practice_problems/:id
  def show
    render json: @practice_problem&.summarize
  end

  # POST /practice_problems/generate
  #
  # Generates candidate practice problems for a lesson via a dedicated OpenAI
  # call (see PracticeProblemGenerator). Returns unsaved candidates for the
  # levelbuilder to review; nothing is persisted here.
  def generate
    lesson = Lesson.find(params[:lesson_id])
    count = params[:count].presence&.to_i || PracticeProblemGenerator::DEFAULT_COUNT
    render json: PracticeProblemGenerator.generate(lesson: lesson, count: count)
  rescue ActiveRecord::RecordNotFound
    head :not_found
  rescue PracticeProblemGenerator::OpenaiError => exception
    CDO.log.error "Practice problem generation failed: #{exception.message}"
    render status: :bad_gateway, json: {error: 'Generation failed. Please try again.'}
  end

  # POST /practice_problems
  #
  # Creates a practice problem (typically an AI-generated one the levelbuilder
  # accepted) and associates it with the lesson's objectives.
  def create
    problem = PracticeProblem.new(practice_problem_params)
    problem.key = generate_key if problem.key.blank?
    if problem.save
      set_lesson_objectives(problem)
      problem.write_serialization
      render json: problem.summarize_for_lesson_edit(Lesson.find_by(id: params[:lesson_id]))
    else
      render status: :bad_request, json: problem.errors.full_messages.join(', ')
    end
  end

  # PATCH/PUT /practice_problems/:id
  def update
    problem = PracticeProblem.find(params[:id])
    if problem.update(practice_problem_params)
      set_lesson_objectives(problem)
      problem.write_serialization
      render json: problem.summarize_for_lesson_edit(Lesson.find_by(id: params[:lesson_id]))
    else
      render status: :bad_request, json: problem.errors.full_messages.join(', ')
    end
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  # DELETE /practice_problems/:id
  #
  # Removes the problem from a lesson by detaching that lesson's objectives.
  # Once the problem is no longer reachable from any objective it is orphaned,
  # and we delete the record and its config file.
  def destroy
    problem = PracticeProblem.find(params[:id])
    lesson = Lesson.find_by(id: params[:lesson_id])
    problem.objectives -= lesson.objectives.to_a if lesson

    if problem.objectives.empty?
      File.delete(problem.file_path) if Rails.application.config.levelbuilder_mode && File.exist?(problem.file_path)
      problem.destroy!
      render json: {deleted: true}
    else
      problem.write_serialization
      render json: problem.summarize_for_lesson_edit(lesson).merge(deleted: false)
    end
  rescue ActiveRecord::RecordNotFound
    head :not_found
  end

  private def practice_problem_params
    attrs = params.permit(:key, :problem_type, :active, :problem_text)
    # solution is a json column holding an array of {option, correct} hashes;
    # correct is a boolean / integer / string depending on problem_type.
    if params.key?(:solution)
      attrs[:solution] = Array(params[:solution]).map do |entry|
        entry.permit(:option, :correct).to_h
      end
    end
    attrs
  end

  # Replaces the problem's objectives within a single lesson while preserving
  # any associations it has through other lessons. Mirrors the tutor-video
  # objective handling. The client sends an empty-string marker for an empty
  # selection since Rails drops truly-empty array params.
  private def set_lesson_objectives(problem)
    return unless params.key?(:objective_ids)
    chosen = Objective.where(id: Array(params[:objective_ids]).reject(&:blank?))
    lesson = Lesson.find_by(id: params[:lesson_id])
    problem.objectives =
      if lesson
        (problem.objectives.where.not(lesson_id: lesson.id).to_a + chosen.to_a).uniq
      else
        chosen.to_a
      end
  end

  private def generate_key
    lesson_part = params[:lesson_id].present? ? "lesson-#{params[:lesson_id]}-" : ''
    "pp-#{lesson_part}#{SecureRandom.hex(6)}"
  end
end

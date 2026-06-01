class PracticeProblemsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_levelbuilder_mode_or_test_env, only: [:create]
  authorize_resource only: [:create, :index]

  # GET /practice_problems?lesson_id=:lesson_id
  # Lists practice problems associated with any objective of the given lesson.
  # Used by the levelbuilder generator UI to show what's already seeded.
  def index
    lesson_id = params.require(:lesson_id)
    problems = PracticeProblem.joins(:objectives).where(objectives: {lesson_id: lesson_id}).distinct
    render json: problems.map(&:summarize)
  end

  # POST /practice_problems
  # Creates one practice problem from the generator UI and writes the
  # corresponding config file under dashboard/config/practice_problems/.
  def create
    objective_keys = Array(params[:objective_keys])

    problem = PracticeProblem.new(practice_problem_params)
    PracticeProblem.transaction do
      problem.save!
      problem.objectives = Objective.where(key: objective_keys)
      problem.write_serialization
    end
    render json: problem.summarize
  rescue ActiveRecord::RecordInvalid => exception
    render status: :bad_request, json: {error: exception.message}
  end

  private def practice_problem_params
    # `correct` is bool for multiple-choice, integer for scramble/sort, and
    # string for match — permit the key without constraining the value type.
    params.permit(:key, :problem_type, :active, :problem_text, solution: [[:option, :correct]])
  end
end

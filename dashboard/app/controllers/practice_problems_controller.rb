class PracticeProblemsController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

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
end

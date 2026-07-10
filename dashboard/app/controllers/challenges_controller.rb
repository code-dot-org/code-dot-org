class ChallengesController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  # GET /challenges?lesson_id=:lesson_id
  def index
    challenges = params[:lesson_id].present? ?
      @challenges.where(lesson_id: params[:lesson_id]) :
      @challenges
    render json: challenges&.map(&:summarize)
  end

  # GET /challenges/:id
  def show
    render json: @challenge&.summarize
  end
end

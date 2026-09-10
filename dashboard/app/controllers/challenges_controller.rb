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

  # GET /challenges/:id/starter_image
  # Streams the whiteboard starter image bytes same-origin, so the client can
  # place it on the canvas and capture it in the submission snapshot without a
  # cross-origin taint. Starter images are always PNG.
  def starter_image
    send_data @challenge.download_starter_image, type: 'image/png', disposition: 'inline'
  rescue AWS::S3::NoSuchKey
    head :not_found
  end
end

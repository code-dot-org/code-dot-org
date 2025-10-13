class AiLessonSummariesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_ai_lesson_summary, only: [:show, :update, :destroy]

  # GET /ai_lesson_summaries
  def index
    @ai_lesson_summaries = current_user.ai_lesson_summaries.includes(:lesson)
    render json: @ai_lesson_summaries.as_json(include: :lesson)
  end

  # GET /ai_lesson_summaries/:id
  def show
    render json: @ai_lesson_summary.as_json(include: :lesson)
  end

  # POST /ai_lesson_summaries
  def create
    @ai_lesson_summary = current_user.ai_lesson_summaries.build(ai_lesson_summary_params)

    if @ai_lesson_summary.save
      render json: @ai_lesson_summary.as_json(include: :lesson), status: :created
    else
      render json: {errors: @ai_lesson_summary.errors}, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /ai_lesson_summaries/:id
  def update
    if @ai_lesson_summary.update(ai_lesson_summary_params)
      render json: @ai_lesson_summary.as_json(include: :lesson)
    else
      render json: {errors: @ai_lesson_summary.errors}, status: :unprocessable_entity
    end
  end

  # DELETE /ai_lesson_summaries/:id
  def destroy
    @ai_lesson_summary.destroy
    head :no_content
  end

  private def set_ai_lesson_summary
    @ai_lesson_summary = current_user.ai_lesson_summaries.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {error: 'AI lesson summary not found'}, status: :not_found
  end

  private def ai_lesson_summary_params
    params.require(:lesson_id, :lesson_summary)
  end
end

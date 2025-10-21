class AiLessonSummariesController < ApplicationController
  before_action :authenticate_user!

  # GET /ai_lesson_summaries/show?user_id=1&lesson_id=2
  def show
    @ai_lesson_summary = AiLessonSummary.find_by(
      user_id: params[:user_id],
      lesson_id: params[:lesson_id]
    )

    if @ai_lesson_summary
      render json: @ai_lesson_summary.as_json(include: :lesson)
    else
      render json: {error: 'AI lesson summary not found'}, status: :not_found
    end
  end

  # POST /ai_lesson_summaries/create_or_update
  def create_or_update
    @ai_lesson_summary = AiLessonSummary.find_by(
      user_id: params[:user_id],
      lesson_id: params[:lesson_id]
    )

    if @ai_lesson_summary
      # Update existing record
      if @ai_lesson_summary.update(lesson_summary: params[:lesson_summary])
        render json: @ai_lesson_summary.as_json(include: :lesson), status: :ok
      else
        render json: {errors: @ai_lesson_summary.errors}, status: :unprocessable_entity
      end
    else
      # Create new record
      @ai_lesson_summary = AiLessonSummary.new(
        user_id: params[:user_id],
        lesson_id: params[:lesson_id],
        lesson_summary: params[:lesson_summary]
      )

      if @ai_lesson_summary.save
        render json: @ai_lesson_summary.as_json(include: :lesson), status: :created
      else
        render json: {errors: @ai_lesson_summary.errors}, status: :unprocessable_entity
      end
    end
  end

  # PATCH/PUT /ai_lesson_summaries/:id
  def update
    @ai_lesson_summary = current_user.ai_lesson_summaries.find(params[:id])

    if @ai_lesson_summary.update(ai_lesson_summary_params)
      render json: @ai_lesson_summary.as_json(include: :lesson)
    else
      render json: {errors: @ai_lesson_summary.errors}, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: {error: 'AI lesson summary not found'}, status: :not_found
  end

  # DELETE /ai_lesson_summaries/:id
  def destroy
    @ai_lesson_summary = current_user.ai_lesson_summaries.find(params[:id])
    @ai_lesson_summary.destroy
    head :no_content
  rescue ActiveRecord::RecordNotFound
    render json: {error: 'AI lesson summary not found'}, status: :not_found
  end

  private def ai_lesson_summary_params
    params.transform_keys(&:underscore).permit(:lesson_id, :user_id, :lesson_summary)
  end
end

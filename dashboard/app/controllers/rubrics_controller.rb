class RubricsController < ApplicationController
  include Rails.application.routes.url_helpers

  before_action :require_levelbuilder_mode_or_test_env, except: [:submit_evaluations, :get_ai_evaluations]
  load_and_authorize_resource except: [:submit_evaluations, :get_ai_evaluations]
  skip_load_resource only: [:create, :submit_evaluations, :get_ai_evaluations]

  # GET /rubrics/:rubric_id/edit
  def edit
    @lesson = @rubric.lesson
  end

  # GET /rubrics/new?lessonId=<lessonId>
  def new
    @lesson = Lesson.find_by(id: params[:lessonId])
    @rubric = Rubric.new
  end

  # POST /rubrics
  def create
    puts "in the create action"
    puts rubric_params.except(:learning_goals_attributes).inspect
    @rubric = Rubric.create!(rubric_params.except(:learning_goals_attributes))
    rubric_params[:learning_goals_attributes].map do |lg_params|
      puts lg_params.inspect
      learning_goal = LearningGoal.create!(lg_params.except(:learning_goal_evidence_levels_attributes).merge(rubric_id: @rubric.id))
      learning_goal.learning_goal_evidence_levels = (lg_params[:learning_goal_evidence_levels_attributes] || []).map do |lge_params|
        LearningGoalEvidenceLevel.new(lge_params)
      end
    end
    @lesson = @rubric.lesson
    if @rubric.save
      @rubric.lesson.script.write_script_json
      render json: {redirectUrl: edit_rubric_path(@rubric.id), rubricId: @rubric.id}
    else
      render :new
    end
  end

  # TODO (Kaitie): Update the update action
  # TODO(KT) [AITT-163]: add notice that rubric was successfully updated
  # PATCH /rubrics/:rubric_id
  def update
    # @lesson = @rubric.lesson
    if @rubric.update(rubric_params)
      @rubric.save!
      @rubric.reload
      puts @rubric.inspect
      #puts @rubric.learning_goals.inspect
      # @lesson.reload
      puts @rubric.lesson.inspect
      @rubric.lesson.script.reload
      puts @rubric.lesson.script.inspect
      puts @rubric.lesson.script.lessons.filter_map(&:rubric).count
      #@rubric.lesson.script.write_script_json
      render json: @rubric
    else
      render action: 'edit'
    end
  end

  # POST /rubrics/:id/submit_evaluations
  def submit_evaluations
    return head :forbidden unless current_user&.teacher?
    permitted_params = params.permit(:id, :student_id)
    learning_goal_ids = LearningGoal.where(rubric_id: permitted_params[:id]).pluck(:id)
    learning_goal_evaluations = LearningGoalEvaluation.where(user_id: permitted_params[:student_id], learning_goal_id: learning_goal_ids, teacher_id: current_user.id)
    submitted_at = Time.now
    if learning_goal_evaluations.update_all(submitted_at: submitted_at)
      render json: {submittedAt: submitted_at}
    else
      return head :bad_request
    end
  end

  # GET /rubrics/:id/get_ai_evaluations
  def get_ai_evaluations
    return head :forbidden unless current_user&.teacher?

    permitted_params = params.transform_keys(&:underscore).permit(:id, :student_id)
    student = User.find(permitted_params[:student_id])
    return head :not_found unless student
    return head :forbidden unless can?(:manage, student)

    learning_goals = LearningGoal.where(rubric_id: permitted_params[:id])
    # Get the most recent AI evaluation for each learning goal
    learning_goal_ai_evaluations =
      LearningGoalAiEvaluation.where(user_id: permitted_params[:student_id], learning_goal_id: learning_goals.pluck(:id)).
        group_by(&:learning_goal_id).
        map {|_, eval_list| eval_list.max_by(&:updated_at)}
    render json: learning_goal_ai_evaluations.map(&:summarize_for_instructor)
  end

  private

  def rubric_params
    params.transform_keys(&:underscore).permit(
      :level_id,
      :lesson_id,
      learning_goals_attributes: [
        :id,
        :learning_goal,
        :ai_enabled,
        :position,
        :_destroy,
        {
          learning_goal_evidence_levels_attributes: [
            :id,
            :learning_goal_id,
            :understanding,
            :teacher_description,
            :ai_prompt
          ]
        }
      ],
    )
  end
end

class LearningGoalTeacherEvaluationsController < ApplicationController
  load_and_authorize_resource

  def create
    @learning_goal_teacher_evaluation.update!(learning_goal_teacher_evaluation_params.merge(teacher_id: current_user.id))
    render json: @learning_goal_teacher_evaluation
  end

  def update
    @learning_goal_teacher_evaluation.update!(learning_goal_teacher_evaluation_params)
    return head :not_found unless @learning_goal_teacher_evaluation
    render json: @learning_goal_teacher_evaluation
  end

  def get_evaluation
    learning_goal_teacher_evaluation = LearningGoalTeacherEvaluation.find_by(
      user_id: learning_goal_teacher_evaluation_params[:user_id],
      teacher_id: current_user.id,
      learning_goal_id: learning_goal_teacher_evaluation_params[:learning_goal_id]
    )
    if learning_goal_teacher_evaluation&.teacher_id == current_user.id
      render json: learning_goal_teacher_evaluation
    else
      head :not_found
    end
  end

  def get_or_create_evaluation
    learning_goal = LearningGoal.find(learning_goal_teacher_evaluation_params[:learning_goal_id])
    @rubric = learning_goal.rubric

    user_storage_id = storage_id_for_user_id(learning_goal_teacher_evaluation_params[:user_id])
    script_level = @rubric.lesson.script_levels.find {|sl| sl.levels.include?(@rubric.level)}
    channel_token = ChannelToken.find_channel_token(
      script_level.level,
      user_storage_id,
      script_level.script_id
    )
    raise "channel token not found for user id #{learning_goal_teacher_evaluation_params[:user_id]} and script level id #{script_level.id}" unless channel_token
    _owner_id, project_id = storage_decrypt_channel_id(channel_token.channel)
    source_data = SourceBucket.new.get(channel_token.channel, "main.json")
    raise "main.json not found for channel id #{channel_id}" unless source_data[:status] == 'FOUND'
    version_id = source_data[:version_id]

    learning_goal_teacher_evaluation = LearningGoalTeacherEvaluation.find_or_create_by!(
      user_id: learning_goal_teacher_evaluation_params[:user_id],
      teacher_id: current_user.id,
      learning_goal_id: learning_goal_teacher_evaluation_params[:learning_goal_id],
      project_id: project_id,
      project_version: version_id,
    )
    render json: learning_goal_teacher_evaluation
  end

  private def learning_goal_teacher_evaluation_params
    eval_params = params.transform_keys(&:underscore)
    eval_params = eval_params.permit(
      :user_id,
      :learning_goal_id,
      :understanding,
      :feedback,
    )
    eval_params
  end
end

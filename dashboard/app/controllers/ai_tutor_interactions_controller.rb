class AiTutorInteractionsController < ApplicationController
  include Rails.application.routes.url_helpers
  before_action :authenticate_user!
  load_and_authorize_resource :ai_tutor_interaction

  # POST /ai_tutor_interactions
  def create
    pp ai_tutor_interaction_params
    return render(status: :forbidden, json: {error: 'This user does not have access to AI Tutor'}) unless current_user.has_ai_tutor_access?
    @ai_tutor_interaction = AiTutorInteraction.new(ai_tutor_interaction_params)
    if @ai_tutor_interaction.save
      render json: {message: "successfully created AiTutorInteraction with id: #{@ai_tutor_interaction.id}"}, status: :created
    else
      render :not_acceptable, json: {error: 'There was an error creating a new AiTutorInteraction.'}
    end
  end

  def ai_tutor_interaction_params
    ai_tutor_interaction_params = params.transform_keys(&:underscore).permit(
      :level_id,
      :script_id,
      :type,
      :prompt,
      :status,
      :ai_response
    )
    ai_tutor_interaction_params[:user_id] = current_user.id
    ai_tutor_interaction_params[:ai_model_version] = SharedConstants::AI_TUTOR_CHAT_MODEL_VERISON
    if params[:isProjectBacked]
      project_data = find_project_and_version_id(params[:levelId], params[:scriptId])
      ai_tutor_interaction_params[:project_id] = project_data[:project_id]
      ai_tutor_interaction_params[:project_version_id] = project_data[:version_id]
    end
    ai_tutor_interaction_params
  end

  def find_project_and_version_id(level_id, script_id)
    project_id = nil
    version_id = nil

    user_storage_id = storage_id_for_user_id(current_user.id)
    level = Level.find(level_id)
    channel_token = ChannelToken.find_channel_token(
      level,
      user_storage_id,
      script_id
    )
    if channel_token
      _owner_id, project_id = storage_decrypt_channel_id(channel_token.channel)
      source_data = SourceBucket.new.get(channel_token.channel, "main.json")
      if source_data[:status] == 'FOUND'
        version_id = source_data[:version_id]
      end
    end

    return {
      project_id: project_id,
      version_id: version_id,
    }
  end
end

class AiTutorInteractionsController < ApplicationController
  include Rails.application.routes.url_helpers
  before_action :authenticate_user!
  load_and_authorize_resource :ai_tutor_interaction

  # POST /ai_tutor_interactions
  def create
    return render(status: :forbidden, json: {error: 'This user does not have access to AI Tutor'}) unless current_user.has_ai_tutor_access?
    return render(status: :not_acceptable, json: {error: 'Staus is unacceptable'}) unless valid_status
    @ai_tutor_interaction = AiTutorInteraction.new(ai_tutor_interaction_params)
    if @ai_tutor_interaction.save
      render json: {message: "successfully created AiTutorInteraction with id: #{@ai_tutor_interaction.id}"}, status: :created
    else
      render(status: :not_acceptable, json: {error: 'There was an error creating a new AiTutorInteraction.'})
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
      project_data = find_project_and_version_id(ai_tutor_interaction_params[:level_id], ai_tutor_interaction_params[:script_id])
      ai_tutor_interaction_params[:project_id] = project_data[:project_id]
      ai_tutor_interaction_params[:project_version_id] = project_data[:version_id]
    end
    ai_tutor_interaction_params
  end

  def valid_status
    SharedConstants::AI_TUTOR_INTERACTION_SAVE_STATUS.value?(params[:status])
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

  # GET /ai_tutor_interactions
  def index
    unless user_has_chat_access?
      return render(status: :forbidden, json: {error: 'This user does not have access to AI Tutor chat messages.'})
    end

    user_ids = determine_user_ids_for_interactions

    interactions = AiTutorInteraction.where(user_id: user_ids)
    render json: format_ai_tutor_interactions(interactions)
  end

  private

  def user_has_chat_access?
    current_user.can_view_student_ai_chat_messages? || current_user.has_ai_tutor_access?
  end

  def determine_user_ids_for_interactions
    if current_user.can_view_student_ai_chat_messages?
      # Teacher scenario
      if params[:sectionId].present?
        section = current_user.sections.find_by(id: params[:sectionId])
        return render(status: :not_found, json: {error: 'Section not found, or user does not have permission for this section.'}) unless section
        section.students.pluck(:id)
      else
        current_user.students.pluck(:id)
      end
    else
      # Student scenario
      [current_user.id]
    end
  end

  def format_ai_tutor_interactions(interactions)
    interactions.includes(:user).map do |interaction|
      interaction.attributes.merge({
        'studentName' => interaction.user.name
      }).transform_keys { |key| key.camelize(:lower) }
    end
  end
end

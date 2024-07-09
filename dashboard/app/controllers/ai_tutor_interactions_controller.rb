class AiTutorInteractionsController < ApplicationController
  include Rails.application.routes.url_helpers
  before_action :authenticate_user!
  load_and_authorize_resource :ai_tutor_interaction

  # POST /ai_tutor_interactions
  def create
    return render(status: :forbidden, json: {error: 'This user does not have access to AI Tutor.'}) unless current_user.has_ai_tutor_access?
    return render(status: :not_acceptable, json: {error: 'Status is unacceptable.'}) unless valid_status
    @ai_tutor_interaction = AiTutorInteraction.new(ai_tutor_interaction_params)
    if @ai_tutor_interaction.save
      render json: {message: "successfully created AiTutorInteraction", id: @ai_tutor_interaction.id}, status: :created
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

    # TODO: We may want to only do this lookup for levels that use the projects system (e.g. level.channel_backed?)
    # For now, since all the levels this is enabled for use projects/are JavaLab levels, we can just do this for all of them.
    project_data = find_project_and_version_id(ai_tutor_interaction_params[:level_id], ai_tutor_interaction_params[:script_id])
    ai_tutor_interaction_params[:project_id] = project_data[:project_id]
    ai_tutor_interaction_params[:project_version_id] = project_data[:version_id]

    ai_tutor_interaction_params
  end

  def valid_status
    SharedConstants::AI_TUTOR_INTERACTION_STATUS.value?(params[:status])
  end

  def find_project_and_version_id(level_id, script_id)
    result = {project_id: nil, version_id: nil}

    user_storage_id = storage_id_for_user_id(current_user.id)
    return result unless user_storage_id

    level = Level.find(level_id)
    return result unless level

    channel_token = ChannelToken.find_channel_token(level, user_storage_id, script_id)
    return result unless channel_token

    _owner_id, result[:project_id] = storage_decrypt_channel_id(channel_token.channel)
    source_data = SourceBucket.new.get(channel_token.channel, "main.json")

    if source_data[:status] == 'FOUND'
      result[:version_id] = source_data[:version_id]
    end

    result
  end

  # GET /ai_tutor_interactions
  def index
    user_ids, error_message = determine_user_ids_for_interactions

    if user_ids.nil?
      render(status: :forbidden, json: {error: error_message || 'Access denied.'}) and return
    end

    interactions = AiTutorInteraction.where(user_id: user_ids)
    render json: format_ai_tutor_interactions(interactions)
  end

  private def user_has_chat_access?
    current_user.can_view_student_ai_chat_messages? || current_user.has_ai_tutor_access?
  end

  private def student_belongs_to_teacher?(student_id)
    current_user.students.exists?(id: student_id)
  end

  private def section_owned_by_current_user?(section_id)
    current_user.sections.exists?(id: section_id)
  end

  private def determine_user_ids_for_interactions
    # If the current user is a student, ignore any filters and return their own ID.
    unless current_user.can_view_student_ai_chat_messages?
      return [current_user.id] if params[:userId].blank? && params[:sectionId].blank?
      # If a student tries to provide filters, return nil and a specific error message.
      return nil, 'Students cannot provide filters.'
    end

    if params[:userId].present?
      user_id = params[:userId].to_i
      if student_belongs_to_teacher?(user_id)
        return [user_id], nil
      else
        return nil, 'Access to the specified student’s chats is not allowed.'
      end
    elsif params[:sectionId].present?
      section = current_user.sections.find_by(id: params[:sectionId])
      if section
        return section.students.pluck(:id), nil
      else
        return nil, 'Section not found, or user does not have permission for this section.'
      end
    else
      return current_user.students.pluck(:id), nil
    end
  end

  private def format_ai_tutor_interactions(interactions)
    interactions.includes(:user).map do |interaction|
      interaction.attributes.merge({
                                     'studentName' => interaction.user.name
                                   }
).transform_keys {|key| key.camelize(:lower)}
    end
  end
end

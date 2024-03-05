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
    return render(status: :forbidden, json: {error: 'This user does not have access to AI Tutor chat messages'}) unless current_user.can_view_student_ai_chat_messages?
    params.require([:sectionId])
    section = Section.find(params[:sectionId])
    students = section.students
    return render(status: :not_found, json: {error: 'Section not found'}) unless section
    return render(status: :forbidden, json: {error: 'This user does not own this section'}) unless current_user.sections.include?(section)
    ai_tutor_interactions = AiTutorInteraction.where(user_id: students.pluck(:id)).map(&:attributes)
    student_chats = []
    ai_tutor_interactions.each do |interaction|
      student_name = students.find(interaction["user_id"]).name
      interaction["student_name"] = student_name
      student_chat = interaction.transform_keys {|key| key.camelize(:lower)}
      student_chats << student_chat
    end
    render json: student_chats
  end

  # GET /ai_tutor_interactions/get_for_student
  def get_for_student
    params.require([:userId])
    student = User.find(params[:userId])
    return render(status: :not_found, json: {error: 'Student not found'}) unless student
    teacher_can_view_chats = current_user.students.include?(student)
    student_can_view_own_chats = student.id == current_user.id
    return render(status: :forbidden, json: {error: 'This user does not have access to these chats'}) unless teacher_can_view_chats || student_can_view_own_chats
    ai_tutor_interactions = AiTutorInteraction.where(user_id: student.id).map(&:attributes)
    student_chats = []
    ai_tutor_interactions.each do |interaction|
      student_chat = interaction.transform_keys {|key| key.camelize(:lower)}
      student_chats << student_chat
    end
    render json: student_chats
  end
end

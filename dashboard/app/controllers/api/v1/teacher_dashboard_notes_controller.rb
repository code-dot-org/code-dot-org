class Api::V1::TeacherDashboardNotesController < Api::V1::JSONApiController
  before_action :authenticate_user!
  before_action :require_teacher!

  def index
    section = find_active_section!(params.require(:section_id))
    unit_id = params.require(:unit_id)

    notes = TeacherDashboardNote.visible_on_page_for(
      current_user,
      section: section,
      unit_id: unit_id,
      unit_group_id: params[:unit_group_id],
      lesson_id: params[:lesson_id]
    ).includes(:teacher_dashboard_note_layouts)

    render json: {
      contexts: {
        sectionId: section.id,
        unitGroupId: optional_integer(params[:unit_group_id]),
        unitId: unit_id.to_i,
        lessonId: optional_integer(params[:lesson_id]),
      },
      notes: serialize_notes(notes)
    }
  rescue ActionController::ParameterMissing, ActiveRecord::RecordNotFound
    head :bad_request
  rescue CanCan::AccessDenied
    head :forbidden
  end

  def create
    attrs = normalized_note_params
    shared_section_ids = attrs.delete(:shared_section_ids)
    note = TeacherDashboardNote.new(attrs)
    note.teacher = current_user
    assign_shared_sections(note, shared_section_ids)

    if note.save
      render json: serialize_note(note.reload), status: :created
    else
      render_bad_request(note)
    end
  end

  def update
    note = TeacherDashboardNote.find_by(id: params[:id])
    return head :not_found unless note
    return head :forbidden unless note.owner?(current_user)

    attrs = normalized_note_params.except(:note_layout_column, :note_position)
    shared_section_ids = attrs.delete(:shared_section_ids)
    requested_lock_version = attrs[:lock_version]
    return head :bad_request if requested_lock_version.nil?

    if requested_lock_version.to_i != note.lock_version
      return render json: {error: 'stale note', note: serialize_note(note)}, status: :conflict
    end

    note.assign_attributes(attrs.except(:lock_version))
    assign_shared_sections(note, shared_section_ids)
    if note.save
      render json: serialize_note(note.reload)
    else
      render_bad_request(note)
    end
  end

  def update_layout
    note = TeacherDashboardNote.find_by(id: params[:id])
    return head :not_found unless note
    return head :forbidden unless note.visible_to?(current_user)

    attrs = normalized_layout_params
    unless attrs.key?(:note_layout_column) && attrs.key?(:note_position)
      return head :bad_request
    end

    layout = TeacherDashboardNoteLayout.find_or_initialize_by(
      teacher_dashboard_note: note,
      teacher: current_user
    )
    layout.assign_attributes(attrs)

    if layout.save
      render json: serialize_note(note.reload)
    else
      render_bad_request(layout)
    end
  end

  def destroy
    note = TeacherDashboardNote.find_by(id: params[:id])
    return head :not_found unless note
    return head :forbidden unless note.owner?(current_user)

    note.destroy!
    head :no_content
  end

  private def require_teacher!
    head :forbidden unless current_user&.teacher?
  end

  private def find_active_section!(section_id)
    section = Section.find(section_id)
    unless section.active_section_instructors.exists?(instructor_id: current_user.id)
      raise CanCan::AccessDenied
    end
    section
  end

  private def note_params
    root = params[:teacherDashboardNote] || params[:teacher_dashboard_note]
    note_parameters = root.respond_to?(:permit) ?
      root :
      ActionController::Parameters.new(root || {})
    note_parameters.permit(
      :title,
      :body,
      :noteColor,
      :note_color,
      :noteLayoutColumn,
      :note_layout_column,
      :notePosition,
      :note_position,
      :contextType,
      :context_type,
      :unitGroupId,
      :unit_group_id,
      :unitId,
      :unit_id,
      :lessonId,
      :lesson_id,
      :sectionId,
      :section_id,
      :sharedWithSection,
      :shared_with_section,
      :shareableGlobally,
      :shareable_globally,
      :lockVersion,
      :lock_version,
      sharedSectionIds: [],
      shared_section_ids: []
    )
  end

  private def layout_params
    root = params[:teacherDashboardNoteLayout] ||
      params[:teacher_dashboard_note_layout] ||
      params[:teacherDashboardNote] ||
      params[:teacher_dashboard_note]
    layout_parameters = root.respond_to?(:permit) ?
      root :
      ActionController::Parameters.new(root || {})
    layout_parameters.permit(
      :noteLayoutColumn,
      :note_layout_column,
      :notePosition,
      :note_position
    )
  end

  private def normalized_note_params
    permitted = note_params
    {
      title: permitted[:title],
      body: permitted[:body],
      note_color: param_value(permitted, :noteColor, :note_color),
      note_layout_column: optional_integer(param_value(permitted, :noteLayoutColumn, :note_layout_column)),
      note_position: optional_integer(param_value(permitted, :notePosition, :note_position)),
      context_type: param_value(permitted, :contextType, :context_type),
      unit_group_id: optional_integer(param_value(permitted, :unitGroupId, :unit_group_id)),
      unit_id: optional_integer(param_value(permitted, :unitId, :unit_id)),
      lesson_id: optional_integer(param_value(permitted, :lessonId, :lesson_id)),
      section_id: optional_integer(param_value(permitted, :sectionId, :section_id)),
      shared_with_section: boolean_param(
        param_value(permitted, :sharedWithSection, :shared_with_section)
      ),
      shareable_globally: boolean_param(
        param_value(permitted, :shareableGlobally, :shareable_globally)
      ),
      lock_version: param_value(permitted, :lockVersion, :lock_version),
      shared_section_ids: shared_section_ids_param(permitted),
    }.compact
  end

  private def normalized_layout_params
    permitted = layout_params
    {
      note_layout_column: optional_integer(param_value(permitted, :noteLayoutColumn, :note_layout_column)),
      note_position: optional_integer(param_value(permitted, :notePosition, :note_position)),
    }.compact
  end

  private def param_value(params_hash, camel_key, snake_key)
    return params_hash[camel_key] if params_hash.key?(camel_key)

    params_hash[snake_key]
  end

  private def boolean_param(value)
    return nil if value.nil?

    ActiveModel::Type::Boolean.new.cast(value)
  end

  private def optional_integer(value)
    return nil if value.blank?

    value.to_i
  end

  private def shared_section_ids_param(params_hash)
    raw_value = param_value(params_hash, :sharedSectionIds, :shared_section_ids)
    return nil if raw_value.nil?

    Array(raw_value).compact_blank.map(&:to_i).uniq
  end

  private def assign_shared_sections(note, shared_section_ids)
    return if shared_section_ids.nil?

    note.shared_section_ids = shared_section_ids
    note.shared_with_section = shared_section_ids.any?
  end

  private def serialize_notes(notes)
    notes.map {|note| serialize_note(note)}
  end

  private def serialize_note(note)
    Api::V1::TeacherDashboardNoteSerializer.new(note, {scope: current_user}).as_json
  end

  private def render_bad_request(note)
    render json: {errors: note.errors.full_messages}, status: :bad_request
  end
end

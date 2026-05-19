class Api::V1::SectionCalendarPlansController < Api::V1::JSONApiController
  before_action :load_section
  before_action :load_unit_context
  before_action :authorize_section_calendar_plan

  def show
    plan = calendar_plan_scope.first
    render json: {plan: plan&.summarize_for_calendar}
  end

  def update
    plan_payload = params.require(:plan).to_unsafe_h
    invalid_ids = invalid_lesson_ids(plan_payload)
    if invalid_ids.any?
      return render json: {
        error: "Lessons do not belong to this unit",
        lessonIds: invalid_ids
      }, status: :bad_request
    end

    plan = nil
    ActiveRecord::Base.transaction do
      plan = calendar_plan_scope.first_or_initialize
      plan.assign_attributes(
        section: @section,
        unit: @unit,
        course_name: @course_name,
        unit_position: @unit_position,
        start_date: field(plan_payload, 'startDate'),
        mode: field(plan_payload, 'mode') || 'weekly_minutes',
        weekly_instructional_minutes: field(plan_payload, 'weeklyInstructionalMinutes') || 225,
        created_by_user: plan.persisted? ? plan.created_by_user : current_user,
        updated_by_user: current_user,
      )
      plan.save!

      replace_recurring_sessions(
        plan,
        Array(field(plan_payload, 'recurringSessions'))
      )
      replace_one_off_sessions(
        plan,
        Array(field(plan_payload, 'oneOffSessions'))
      )
      replace_cancellations(plan, Array(field(plan_payload, 'cancellations')))
      replace_items(plan, Array(field(plan_payload, 'items')))
    end

    render json: {plan: plan.reload.summarize_for_calendar}
  end

  def destroy
    calendar_plan_scope.destroy_all
    head :no_content
  end

  private def load_section
    @section = Section.find(params[:section_id] || params[:id])
  end

  private def load_unit_context
    @course_name = params.require(:course_name)
    @unit_position = params.require(:unit_position).to_i

    context = Queries::Courses.get_unit_context(@course_name, @unit_position)
    unless context
      return render json: {error: "Can't find Unit params=#{params}"},
        status: :bad_request
    end

    @unit = context[:unit]
    @unit_group = context[:unit_group]
    @unit_group_unit = context[:unit_group_unit]
  end

  private def authorize_section_calendar_plan
    action = request.get? ? :read : :update
    authorize! action, @section
  end

  private def calendar_plan_scope
    SectionCalendarPlan.where(
      section: @section,
      course_name: @course_name,
      unit_position: @unit_position
    )
  end

  private def field(hash, name)
    hash[name] || hash[name.underscore]
  end

  private def invalid_lesson_ids(plan_payload)
    submitted_lesson_ids = Array(field(plan_payload, 'items')).
      filter_map {|item| field(item, 'lessonId')}.
      map(&:to_i).
      uniq
    unit_lesson_ids = @unit.lessons.map(&:id)

    submitted_lesson_ids - unit_lesson_ids
  end

  private def replace_recurring_sessions(plan, sessions_payload)
    plan.recurring_sessions.destroy_all
    sessions_payload.each do |session_payload|
      active_value = field(session_payload, 'active')
      plan.recurring_sessions.create!(
        client_id: field(session_payload, 'clientId'),
        weekday: field(session_payload, 'weekday'),
        start_time: field(session_payload, 'startTime'),
        duration_minutes: field(session_payload, 'durationMinutes'),
        position: field(session_payload, 'position') || 0,
        active: active_value.nil? ? true : active_value
      )
    end
  end

  private def replace_one_off_sessions(plan, sessions_payload)
    plan.one_off_sessions.destroy_all
    sessions_payload.each do |session_payload|
      plan.one_off_sessions.create!(
        client_id: field(session_payload, 'clientId'),
        session_date: field(session_payload, 'sessionDate'),
        start_time: field(session_payload, 'startTime'),
        duration_minutes: field(session_payload, 'durationMinutes'),
        position: field(session_payload, 'position') || 0
      )
    end
  end

  private def replace_cancellations(plan, cancellations_payload)
    plan.cancellations.destroy_all
    recurring_by_client_id = plan.recurring_sessions.index_by(&:client_id)
    one_off_by_client_id = plan.one_off_sessions.index_by(&:client_id)

    cancellations_payload.each do |cancellation_payload|
      recurring_session = recurring_by_client_id[
        field(cancellation_payload, 'recurringSessionClientId')
      ]
      one_off_session = one_off_by_client_id[
        field(cancellation_payload, 'oneOffSessionClientId')
      ]
      plan.cancellations.create!(
        recurring_session: recurring_session,
        one_off_session: one_off_session,
        session_date: field(cancellation_payload, 'sessionDate'),
        reason: field(cancellation_payload, 'reason')
      )
    end
  end

  private def replace_items(plan, items_payload)
    plan.items.destroy_all
    items_payload.each do |item_payload|
      plan.items.create!(
        client_id: field(item_payload, 'clientId'),
        item_type: field(item_payload, 'itemType'),
        lesson_id: field(item_payload, 'lessonId'),
        placeholder_title: field(item_payload, 'placeholderTitle'),
        planned_minutes: field(item_payload, 'plannedMinutes'),
        split_group_id: field(item_payload, 'splitGroupId'),
        split_part_index: field(item_payload, 'splitPartIndex'),
        split_part_count: field(item_payload, 'splitPartCount'),
        session_date: field(item_payload, 'sessionDate'),
        session_client_id: field(item_payload, 'sessionClientId'),
        session_sort: field(item_payload, 'sessionSort'),
        removed: field(item_payload, 'removed') || false
      )
    end
  end
end

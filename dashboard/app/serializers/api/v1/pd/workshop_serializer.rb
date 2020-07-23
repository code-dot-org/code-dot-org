class Api::V1::Pd::WorkshopSerializer < ActiveModel::Serializer
  attributes :id, :organizer, :location_name, :location_address, :course,
    :subject, :capacity, :notes, :fee, :state, :facilitators,
    :enrolled_teacher_count, :sessions, :account_required_for_attendance?,
    :enrollment_code, :pre_workshop_survey_url, :attended, :on_map, :funded, :funding_type, :ready_to_close?,
    :workshop_starting_date, :date_and_location_name, :regional_partner_name, :regional_partner_id,
    :scholarship_workshop?, :can_delete, :created_at, :virtual, :suppress_email, :third_party_provider

  def sessions
    object.sessions.map do |session|
      Api::V1::Pd::SessionSerializer.new(session).attributes
    end
  end

  def organizer
    {id: object.organizer.id, name: object.organizer.name, email: object.organizer.email}
  rescue
    # Fallback value if workshop organizer, who is a user, no longer exists
    {id: nil, name: nil, email: nil}
  end

  def facilitators
    object.facilitators.map do |facilitator|
      {id: facilitator.id, name: facilitator.name, email: facilitator.email}
    end
  end

  def enrolled_teacher_count
    object.enrollments.count
  end

  def enrollment_code
    @scope.try(:[], :enrollment_code)
  end

  def user_enrollment
    object.enrollments.find_by(code: @scope.try(:[], :enrollment_code))
  end

  def pre_workshop_survey_url
    user_enrollment&.pre_workshop_survey_url
  end

  def attended
    user_enrollment&.attendances&.any?
  end

  def regional_partner_name
    object.regional_partner.try(:name)
  end

  def can_delete
    @scope.try(:[], :current_user) && object.can_user_delete?(@scope[:current_user])
  end
end

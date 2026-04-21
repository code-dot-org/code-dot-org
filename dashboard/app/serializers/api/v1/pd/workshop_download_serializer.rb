class Api::V1::Pd::WorkshopDownloadSerializer < ActiveModel::Serializer
  attributes :id,  :name, :status, :created_date, :start_date, :session_dates, :session_locations, :organizer_name, :organizer_email, :regional_partner_name, :course, :subject, :enrollment_url, :enrolled_teacher_count, :capacity, :facilitators, :cohort_type, :virtual, :fee, :prereq, :grades, :description, :registration_link, :hidden_from_catalog,
  def status
    object.state
  end

  def created_date
    object.created_at&.to_date&.iso8601
  end

  def start_date
    object.workshop_starting_date.try(&:to_date).try(&:iso8601)
  end

  def session_dates
    object.sessions.map(&:formatted_date_with_start_and_end_times).join("\n")
  end

  def session_locations
    object.sessions.map(&:formatted_location_details).join("\n")
  end

  def organizer_name
    object.organizer.try(&:name)
  end

  def organizer_email
    object.organizer.try(&:email)
  end

  def regional_partner_name
    object.regional_partner.try(:name)
  end

  def enrollment_url
    CDO.studio_url("/professional-learning/workshops/#{object.id}", 'https:')
  end

  def enrolled_teacher_count
    object.enrollments.count
  end

  def facilitators
    object.facilitators.map {|f| "#{f.name} <#{f.email}>"}.join("\n")
  end

  def virtual
    object.virtual?
  end

  def cohort_type
    object.participant_group_type
  end

  def hidden_from_catalog
    object.hidden
  end
end

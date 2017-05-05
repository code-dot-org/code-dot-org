class Api::V1::Pd::WorkshopDownloadSerializer < ActiveModel::Serializer
  attributes :id, :status, :dates, :organizer_name, :organizer_email, :location_address,
    :location_name, :workshop_type, :course, :subject, :enrollment_url, :enrolled_teacher_count,
    :capacity, :facilitators, :notes

  delegate :workshop_type, to: :object

  def status
    object.state
  end

  def dates
    object.sessions.map(&:formatted_date_with_start_and_end_times).join("\n")
  end

  def organizer_name
    object.organizer.try(&:name)
  end

  def organizer_email
    object.organizer.try(&:email)
  end

  def enrollment_url
    CDO.studio_url("/pd/workshops/#{object.id}/enroll", 'https:')
  end

  def enrolled_teacher_count
    object.enrollments.count
  end

  def facilitators
    object.facilitators.map {|f| "#{f.name} <#{f.email}>"}.join("\n")
  end
end

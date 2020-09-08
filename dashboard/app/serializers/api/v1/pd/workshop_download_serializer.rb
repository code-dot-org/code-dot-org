# NOTE: This serializer is used in two places.
#
#   1. Workshop dashboard CSV downloads (workshops_controller#filter)
#   2. Automated workshop tracker export (summer_workshops_to_gdrive)
#
# The workshop tracker includes a bunch of formulas that are dependent on the layout of
# the export, so please check that the programs team is okay making updates there
# before adding a column to the middle of this list.  If they are not, consider
# breaking this into two serializers.
class Api::V1::Pd::WorkshopDownloadSerializer < ActiveModel::Serializer
  attributes :id, :status, :created_date, :start_date, :sessions, :organizer_name, :organizer_email, :regional_partner_name,
    :location_address, :location_name, :on_map, :funded, :course, :subject, :enrollment_url,
    :enrolled_teacher_count, :capacity, :facilitators, :virtual, :third_party_provider, :notes

  def status
    object.state
  end

  def created_date
    object.created_at&.to_date&.iso8601
  end

  def start_date
    object.workshop_starting_date.try(&:to_date).try(&:iso8601)
  end

  def sessions
    object.sessions.map(&:formatted_date_with_start_and_end_times).join("\n")
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
    CDO.studio_url("/pd/workshops/#{object.id}/enroll", 'https:')
  end

  def enrolled_teacher_count
    object.enrollments.count
  end

  def facilitators
    object.facilitators.map {|f| "#{f.name} <#{f.email}>"}.join("\n")
  end
end

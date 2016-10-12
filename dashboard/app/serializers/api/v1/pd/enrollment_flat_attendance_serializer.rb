# Write a flat list of workshop attendance by session for the enrollment
class Api::V1::Pd::EnrollmentFlatAttendanceSerializer < ActiveModel::Serializer
  attributes :name, :email, :in_section?

  # Add dynamic attributes for each session's date and attendance
  def attributes(attrs = {})
    super(attrs).tap do |data|
      object.workshop.sessions.each_with_index do |session, i|
        data["session_#{i + 1}_date".to_sym] = session.formatted_date
        data["session_#{i + 1}_attendance".to_sym] = session.attendances.exists?(teacher_id: object.resolve_user.try(:id))
      end
    end
  end
end

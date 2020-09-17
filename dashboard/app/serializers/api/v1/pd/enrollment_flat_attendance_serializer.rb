# Write a flat list of workshop attendance by session for the enrollment
class Api::V1::Pd::EnrollmentFlatAttendanceSerializer < ActiveModel::Serializer
  attributes :first_name, :last_name, :email, :district_name, :school, :role, :grades_teaching, :cdo_scholarship, :other_scholarship

  def district_name
    object.school_info&.school_district&.name
  end

  def school
    object.school_info&.school&.name || object.school_info&.school_name || object.school
  end

  def cdo_scholarship
    object.scholarship_status == Pd::ScholarshipInfoConstants::YES_CDO ? 'Yes' : ''
  end

  def other_scholarship
    object.scholarship_status == Pd::ScholarshipInfoConstants::YES_OTHER ? 'Yes' : ''
  end

  # Add dynamic attributes for each session's date and attendance
  def attributes(requested_attrs = nil, reload = false)
    super(requested_attrs, reload).tap do |data|
      object.workshop.sessions.each_with_index do |session, i|
        data["session_#{i + 1}_date".to_sym] = session.formatted_date
        data["session_#{i + 1}_attendance".to_sym] = session.attendances.where(pd_enrollment_id: object.id).exists?
      end
    end
  end
end

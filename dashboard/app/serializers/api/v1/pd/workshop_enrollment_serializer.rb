class Api::V1::Pd::WorkshopEnrollmentSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :email, :alternate_email, :application_id, :district_name, :school, :role,
    :grades_teaching, :attended_csf_intro_workshop, :csf_course_experience,
    :csf_courses_planned, :user_id, :attended,
    :pre_workshop_survey, :previous_courses, :attendances,
    :scholarship_status, :enrolled_date, :years_teaching, :years_teaching_cs, :taught_ap_before, :planning_to_teach_ap

  def user_id
    user = object.resolve_user
    user&.id
  end

  def application_id
    object&.application&.id
  end

  def alternate_email
    # Note: Use dig instead of [] because RuboCop doesn't like chaining ordinary method call after safe navigation operator.
    object&.application&.sanitized_form_data_hash&.dig(:alternate_email)
  end

  def school
    object.try(:school_info).try {|si| si.school.try(:name) || si.school_name} || object.school
  end

  def district_name
    object.try(:school_info).try(:school_district).try(:name)
  end

  def attended
    object.attendances.exists?
  end

  def pre_workshop_survey
    object.pre_workshop_survey.try do |survey|
      survey.form_data_hash.merge(
        {unitLessonShortName: survey.unit_lesson_short_name}
      )
    end
  end

  def attendances
    object.attendances.count
  end

  def enrolled_date
    object.created_at&.to_date&.iso8601
  end
end

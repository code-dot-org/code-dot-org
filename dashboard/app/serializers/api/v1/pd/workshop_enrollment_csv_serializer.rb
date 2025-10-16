class Api::V1::Pd::WorkshopEnrollmentCsvSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :email, :alternate_email, :application_id, :district_name, :school, :role,
    :grades_teaching, :attended_csf_intro_workshop, :csf_course_experience,
    :csf_courses_planned, :user_id, :attended,
    :pre_workshop_survey, :previous_courses, :attendances,
    :scholarship_status, :enrolled_date, :years_teaching, :years_teaching_cs, :taught_ap_before, :planning_to_teach_ap

  # Prefer resolved_user fields when present; fall back to enrollment values.

  def first_name
    resolved_user&.given_name.presence || object.first_name
  end

  def last_name
    resolved_user&.family_name.presence || object.last_name
  end

  def email
    resolved_user&.email.presence || object.email
  end

  def role
    resolved_user&.educator_role.presence || object.role
  end

  def school
    # Prefer user school_info first, then enrollment school_info, then enrollment.school string
    if user_school_info.present?
      user_school_info.effective_school_name || "Does not teach in a school setting"
    else
      enrollment_school_info&.school&.name || enrollment_school_info&.school_name || object.school
    end
  end

  def district_name
    user_school_info&.school_district&.name.presence ||
      enrollment_school_info&.school_district&.name
  end

  def user_id
    resolved_user&.id
  end

  def application_id
    object&.application&.id
  end

  def alternate_email
    # RuboCop-friendly: dig after safe-nav
    object&.application&.sanitized_form_data_hash&.dig(:alternate_email)
  end

  def attended
    object.attendances.exists?
  end

  def pre_workshop_survey
    object.pre_workshop_survey&.then do |survey|
      survey.form_data_hash.merge({unitLessonShortName: survey.unit_lesson_short_name})
    end
  end

  def attendances
    object.attendances.count
  end

  def enrolled_date
    object.created_at&.to_date&.iso8601
  end

  def resolved_user
    @resolved_user ||= object.resolve_user
  end

  def user_school_info
    resolved_user&.school_info
  end

  def enrollment_school_info
    object&.school_info
  end
end

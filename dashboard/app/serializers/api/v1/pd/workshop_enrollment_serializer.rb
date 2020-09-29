class Api::V1::Pd::WorkshopEnrollmentSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :email, :alternate_email, :application_id, :district_name, :school, :role,
    :grades_teaching, :attended_csf_intro_workshop, :csf_course_experience,
    :csf_courses_planned, :csf_has_physical_curriculum_guide, :user_id, :attended,
    :pre_workshop_survey, :previous_courses, :replace_existing, :attendances,
    :scholarship_status, :scholarship_ineligible_reason, :enrolled_date,
    :years_teaching, :years_teaching_cs, :taught_ap_before, :planning_to_teach_ap

  def user_id
    user = object.resolve_user
    user ? user.id : nil
  end

  def alternate_email
    application_id = object.application_id
    return unless application_id

    # Note: Use dig instead of [] because RuboCop doesn't like chaining ordinary method call after safe navigation operator.
    Pd::Application::ApplicationBase.find(application_id)&.
      sanitize_form_data_hash&.
      dig(:alternate_email)
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

  def scholarship_ineligible_reason
    object.newly_accepted_facilitator? ? Pd::EnrollmentConstants::SCHOLARSHIP_INELIGIBLE_NEW_FACILITATOR : nil
  end

  def enrolled_date
    object.created_at&.to_date&.iso8601
  end
end

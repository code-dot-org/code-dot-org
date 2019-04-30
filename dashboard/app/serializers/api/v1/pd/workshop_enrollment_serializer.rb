class Api::V1::Pd::WorkshopEnrollmentSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :email, :district_name, :school, :role,
    :grades_teaching, :attended_csf_intro_workshop, :csf_course_experience,
    :csf_courses_planned, :csf_has_physical_curriculum_guide, :user_id, :attended,
    :pre_workshop_survey, :previous_courses, :replace_existing, :attendances,
    :scholarship_status, :scholarship_ineligible_reason

  def user_id
    user = object.resolve_user
    user ? user.id : nil
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
end

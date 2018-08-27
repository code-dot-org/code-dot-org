class Api::V1::Pd::WorkshopEnrollmentSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :email, :district_name, :school, :role, :grades_teaching, :user_id, :attended, :pre_workshop_survey

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
end

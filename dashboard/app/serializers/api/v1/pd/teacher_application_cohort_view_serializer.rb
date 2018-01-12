class Api::V1::Pd::TeacherApplicationCohortViewSerializer < ActiveModel::Serializer
  attributes :id, :date_accepted, :applicant_name, :district_name, :school_name, :email,
    :assigned_workshop, :registered_workshop

  def email
    object.user.email
  end
end

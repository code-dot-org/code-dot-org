class Api::V1::Pd::FacilitatorApplicationCohortViewSerializer < ActiveModel::Serializer
  attributes :id, :date_accepted, :applicant_name, :district_name, :school_name, :email, :status

  def email
    object.user.email
  end
end

class Api::V1::Pd::FacilitatorApplicationCohortViewSerializer < ActiveModel::Serializer
  attributes :id, :date_accepted, :applicant_name, :district_name, :school_name, :email

  def date_accepted
    object.accepted_at.try(:strftime, '%b %e')
  end

  def email
    object.user.email
  end
end

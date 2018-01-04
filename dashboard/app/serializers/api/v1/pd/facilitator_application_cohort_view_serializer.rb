class Api::V1::Pd::FacilitatorApplicationCohortViewSerializer < ActiveModel::Serializer
  attributes :id, :date_accepted, :applicant_name, :district_name, :school_name, :email,
    :notified, :assigned_fit, :registered_fit

  def date_accepted
    object.accepted_at.try(:strftime, '%b %e')
  end

  def email
    object.user.email
  end

  def notified
    # TODO: (mehal) implement this
    'Not implemented'
  end

  def assigned_fit
    # TODO: (mehal) implement this
    'Not implemented'
  end

  def registered_fit
    # TODO: (mehal) implement this
    'Not implemented'
  end
end

class Api::V1::Pd::ApplicationCohortViewSerializer < ActiveModel::Serializer
  attributes :date_accepted, :applicant_name, :district_name, :school_name, :email,
    :registered_for_summer_workshop

  def email
    object.user.email
  end

  def date_accepted
    # TODO: mehal - Implement this
    'Not implemented yet'
  end

  def registered_for_summer_workshop
    # TODO: mehal - Implement this
    'Not implemented yet'
  end
end

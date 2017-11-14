class Api::V1::Pd::ApplicationSerializer < ActiveModel::Serializer
  attributes :regional_partner_name, :locked?, :notes, :form_data, :status,
    :school_name, :district_name, :email, :application_type

  def email
    object.user.email
  end

  # Include the full answers here
  def form_data
    object.full_answers_camelized
  end

  def application_type
    object.type.split('::').last
  end
end

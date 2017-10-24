class Api::V1::Pd::ApplicationSerializer < ActiveModel::Serializer
  attributes :regional_partner_name, :locked?, :notes, :form_data, :status,
    :school_name, :district_name, :email

  def school_name
    object.user.school_info.try(:effective_school_name).try(:titleize)
  end

  def district_name
    object.user.school_info.try(:effective_school_district_name).try(:titleize)
  end

  def email
    object.user.email
  end
end

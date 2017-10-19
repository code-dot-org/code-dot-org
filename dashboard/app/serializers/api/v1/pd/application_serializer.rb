class Api::V1::Pd::ApplicationSerializer < ActiveModel::Serializer
  attributes :regional_partner, :locked?, :notes, :form_data

  def regional_partner
    RegionalPartner.find(object.regional_partner_id).name
  end
end

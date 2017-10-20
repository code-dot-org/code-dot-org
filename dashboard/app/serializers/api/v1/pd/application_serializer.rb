class Api::V1::Pd::ApplicationSerializer < ActiveModel::Serializer
  attributes :regional_partner_name, :locked?, :notes, :form_data
end

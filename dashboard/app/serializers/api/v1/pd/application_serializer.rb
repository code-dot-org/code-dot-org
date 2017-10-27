class Api::V1::Pd::ApplicationSerializer < ActiveModel::Serializer
  attributes :regional_partner_name, :locked?, :notes, :form_data, :status,
    :school_name, :district_name, :email, :response_scores_hash

  def email
    object.user.email
  end
end

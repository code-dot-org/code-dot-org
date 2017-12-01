class Api::V1::Pd::ApplicationQuickViewSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :applicant_name, :district_name, :school_name, :status, :locked, :notes, :regional_partner_id

  def locked
    object.locked?
  end
end

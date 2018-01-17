class Api::V1::Pd::ApplicationQuickViewSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :applicant_name, :district_name, :school_name, :status,
    :locked, :notes, :regional_partner_id, :principal_approval, :total_score, :meets_criteria

  def locked
    object.locked?
  end

  def principal_approval
    object.try(:principal_approval)
  end

  def meets_criteria
    object.try(:meets_criteria)
  end
end

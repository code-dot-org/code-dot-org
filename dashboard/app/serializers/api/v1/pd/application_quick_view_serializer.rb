class Api::V1::Pd::ApplicationQuickViewSerializer < ActiveModel::Serializer
  attributes(
    :id,
    :created_at,
    :applicant_name,
    :district_name,
    :school_name,
    :status,
    :locked,
    :notes,
    :notes_2,
    :notes_3,
    :notes_4,
    :notes_5,
    :regional_partner_id,
    :principal_approval_state,
    :total_score,
    :meets_criteria,
    :meets_scholarship_criteria,
    :friendly_scholarship_status
  )

  def locked
    object.locked?
  end

  def principal_approval_state
    object.try(:principal_approval_state)
  end

  def meets_criteria
    object.try(:meets_criteria)
  end

  def meets_scholarship_criteria
    object.try(:meets_scholarship_criteria)
  end

  def friendly_scholarship_status
    object.try(:friendly_scholarship_status)
  end
end

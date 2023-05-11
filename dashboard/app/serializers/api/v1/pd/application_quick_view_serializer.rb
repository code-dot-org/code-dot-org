class Api::V1::Pd::ApplicationQuickViewSerializer < ActiveModel::Serializer
  attributes(
    :id,
    :date_applied,
    :applicant_name,
    :district_name,
    :school_name,
    :status,
    :notes,
    :notes_2,
    :notes_3,
    :notes_4,
    :notes_5,
    :regional_partner_id,
    :principal_approval_state,
    :principal_approval_not_required,
    :total_score,
    :meets_criteria,
    :meets_scholarship_criteria,
    :friendly_scholarship_status,
    :allow_sending_principal_email
  )

  def principal_approval_state
    object.try(:principal_approval_state)
  end

  def principal_approval_not_required
    object.try(:principal_approval_not_required)
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

  def allow_sending_principal_email
    object.try(:allow_sending_principal_email?)
  end
end

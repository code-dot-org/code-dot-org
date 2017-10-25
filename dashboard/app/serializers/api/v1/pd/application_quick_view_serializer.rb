class Api::V1::Pd::ApplicationQuickViewSerializer < ActiveModel::Serializer
  attributes :created_at, :name, :district_name, :school_name, :status

  def name
    "#{object.sanitize_form_data_hash[:first_name]} #{object.sanitize_form_data_hash[:last_name]}"
  end

  def school_name
    object.user.school_info.try(:effective_school_name).try(:titleize) || ''
  end

  def district_name
    object.user.school_info.try(:effective_school_district_name).try(:titleize) || ''
  end
end

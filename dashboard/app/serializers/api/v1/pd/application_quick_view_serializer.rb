class Api::V1::Pd::ApplicationQuickViewSerializer < ActiveModel::Serializer
  attributes :created_at, :district_name, :school_name, :status

  def school_name
    object.user.school_info.try(:effective_school_name).try(:titleize) || ''
  end

  def district_name
    object.user.school_info.try(:effective_school_district_name).try(:titleize) || ''
  end
end

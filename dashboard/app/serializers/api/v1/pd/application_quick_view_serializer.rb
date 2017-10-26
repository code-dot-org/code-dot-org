class Api::V1::Pd::ApplicationQuickViewSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :name, :district_name, :school_name, :status

  def name
    "#{object.sanitize_form_data_hash[:first_name]} #{object.sanitize_form_data_hash[:last_name]}"
  end
end

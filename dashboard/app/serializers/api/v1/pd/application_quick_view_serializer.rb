class Api::V1::Pd::ApplicationQuickViewSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :applicant_name, :district_name, :school_name, :status
end

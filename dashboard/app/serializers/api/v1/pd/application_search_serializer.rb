class Api::V1::Pd::ApplicationSearchSerializer < ActiveModel::Serializer
  attributes :id, :application_type, :course
end

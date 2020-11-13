class Api::V1::SchoolSerializer < ActiveModel::Serializer
  attributes :id, :name, :afe_high_needs

  def afe_high_needs
    object.afe_high_needs?
  end
end

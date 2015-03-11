class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :name, :district_id
  def district_id
    object.try(:district).try(:id)
  end
end

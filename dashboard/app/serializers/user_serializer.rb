class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :name, :district_id
  def district_id
    object.district.id
  end
end

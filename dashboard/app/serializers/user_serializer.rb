class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :ops_first_name, :ops_last_name, :district
  def district
    DistrictSerializer.new(object.district).attributes if object
  end
end

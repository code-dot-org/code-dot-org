class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :ops_first_name, :ops_last_name, :district, :ops_school, :ops_gender
  def district
    DistrictSerializer.new(object.district).attributes if object
  end
end

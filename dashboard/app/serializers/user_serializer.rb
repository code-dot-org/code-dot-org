class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :ops_first_name, :ops_last_name, :district_id
  def district_id
    object.try(:district).try(:id)
  end
end

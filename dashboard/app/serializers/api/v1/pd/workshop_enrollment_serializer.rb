class Api::V1::Pd::WorkshopEnrollmentSerializer < ActiveModel::Serializer
  attributes :name, :email, :district_name, :school, :user_id

  def user_id
    user = object.resolve_user
    user ? user.id : nil
  end

  def district_name
    object.school_district.try(:name)
  end
end

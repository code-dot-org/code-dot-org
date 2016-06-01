class Api::V1::Pd::WorkshopEnrollmentSerializer < ActiveModel::Serializer
  attributes :name, :email, :school_district_id, :school, :user_id

  def user_id
    object.user ? object.user.id : nil
  end
end

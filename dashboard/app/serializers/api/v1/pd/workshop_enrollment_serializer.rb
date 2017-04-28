class Api::V1::Pd::WorkshopEnrollmentSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :email, :district_name, :school, :user_id, :in_section

  def user_id
    user = object.resolve_user
    user ? user.id : nil
  end

  def school
    object.try(:school_info).try {|si| si.school.try(:name) || si.school_name} || object.school
  end

  def district_name
    object.try(:school_info).try(:school_district).try(:name)
  end

  def in_section
    object.in_section?
  end
end

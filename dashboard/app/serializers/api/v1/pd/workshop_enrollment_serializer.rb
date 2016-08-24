class Api::V1::Pd::WorkshopEnrollmentSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :district_name, :school, :user_id, :in_section

  def user_id
    user = object.resolve_user
    user ? user.id : nil
  end

  def district_name
    school_district_id = object.try(:school_info).try(:school_district_id)
    school_district = SchoolDistrict.find(school_district_id) if school_district_id
    school_district.name if school_district
  end

  def in_section
    object.in_section?
  end
end

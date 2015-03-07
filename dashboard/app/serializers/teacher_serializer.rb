class TeacherSerializer < ActiveModel::Serializer
  # first name, last name, email, district, gender and any workshop details that are available for teachers
  attributes :id, :email, :name, :district, :gender
  def district
    DistrictSerializer.new(object.district).attributes
  end
end

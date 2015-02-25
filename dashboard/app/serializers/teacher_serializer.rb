class TeacherSerializer < ActiveModel::Serializer
  attributes :id, :email, :name, :district
  def district
    DistrictSerializer.new(object.district).attributes
  end
end

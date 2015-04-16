class WorkshopTeacherSerializer < ActiveModel::Serializer
  attributes :id, :email, :ops_first_name, :ops_last_name, :district, :ops_school, :ops_gender, :attendances

  def attendances
    # object.attendances.map{|attendance| WorkshopTeacher.new(attendance).attributes}
  end
end

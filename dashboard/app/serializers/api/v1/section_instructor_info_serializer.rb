# This serializer is used to return necessary information about the section
# to /dashboardapi/sections.
class Api::V1::SectionInstructorInfoSerializer < ActiveModel::Serializer
  attributes :status, :instructor_name, :instructor_email

  def instructor_name
    object.instructor.name
  end

  def instructor_email
    object.instructor.email
  end
end

# This serializer is used to return necessary information about the section
# to /dashboardapi/sections.
class Api::V1::SectionInstructorInfoSerializer < ActiveModel::Serializer
  attributes :id, :status, :instructor_name, :instructor_email

  def instructor_name
    object.instructor&.name if object.active?
  end

  def instructor_email
    object.instructor&.email
  end
end

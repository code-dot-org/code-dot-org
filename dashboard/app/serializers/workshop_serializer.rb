# == Schema Information
#
# Table name: workshops
#
#  id           :integer          not null, primary key
#  name         :string(255)
#  program_type :string(255)      not null
#  location     :string(255)
#  instructions :string(255)
#  created_at   :datetime
#  updated_at   :datetime
#  phase        :text(65535)
#
# Indexes
#
#  index_workshops_on_name          (name)
#  index_workshops_on_program_type  (program_type)
#

class WorkshopSerializer < ActiveModel::Serializer
  attributes :id, :name, :program_type, :location, :instructions, :phase, :cohorts
  has_many :segments
  has_many :facilitators, serializer: UserSerializer
  has_many :teachers
  has_many :unexpected_teachers, serializer: UserSerializer

  def teachers
    object.teachers.map do |teacher|
      teacher_attendances = object.segments.map do |segment|
        WorkshopAttendanceSerializer.new(WorkshopAttendance.find_or_initialize_by(teacher_id: teacher.id, segment_id: segment.id)).attributes
      end
      UserSerializer.new(teacher).attributes.merge(attendances: teacher_attendances)
    end
  end

  def unexpected_teachers
    object.unexpected_teachers.map do |unexpected_teacher|
      unexpected_teacher_attendances = object.segments.map do |segment|
        WorkshopAttendanceSerializer.new(WorkshopAttendance.find_or_initialize_by(teacher_id: unexpected_teacher.id, segment_id: segment.id)).attributes
      end
      UserSerializer.new(unexpected_teacher).attributes.merge(attendances: unexpected_teacher_attendances)
    end
  end
end

class WorkshopSerializer < ActiveModel::Serializer
  attributes :id, :name, :program_type, :location, :instructions, :cohort_id
  has_many :segments
  has_many :facilitators, serializer: UserSerializer
  has_many :teachers

  def teachers
    object.teachers.map do |teacher|
      teacher_attendances = object.segments.map do |segment|
        WorkshopAttendanceSerializer.new(WorkshopAttendance.find_or_initialize_by(teacher_id: teacher.id, segment_id: segment.id)).attributes
      end
      UserSerializer.new(teacher).attributes.merge(attendances:teacher_attendances)
    end
  end
end

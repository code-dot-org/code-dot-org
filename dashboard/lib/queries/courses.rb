class Queries::Courses
  # Fetches the course context for a given Unit name. This is needed because
  # sometimes we need to guess what UnitGroup/Course a Unit is part of
  # because the URL doesn't provide that context.
  #
  # Returns `nil` if the script name does not correspond to a valid Unit,
  # UnitGroupUnit, or UnitGroup/Course.
  #
  # @param unit_name [String] The name of the Unit used to fetch the course context.
  # @return [Hash, nil] A hash containing the course and unit group unit,
  #   or `nil` if no valid course context is found.
  #   The hash has the following structure:
  #     - `:course` - The retrieved Unit/Course
  #     - `:unit_group_unit` - The associated UnitGroupUnit information
  def self.get_course_context(unit_name)
    unit = Unit.get_from_cache(unit_name)
    return nil unless unit
    unit_group_unit = UnitGroupUnit.where(script_id: unit.id).first
    return nil unless unit_group_unit
    course = UnitGroup.get_from_cache(unit_group_unit.course_id)
    {course: course, unit_group_unit: unit_group_unit}
  end
end

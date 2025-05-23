class Queries::Courses
  # Fetches the context for the given Unit.
  # @param course_name [String] The name of the UnitGroup the Unit is in.
  # @param unit_position [String, Integer] The position in the UnitGroup of the Unit.
  # @return [Hash, nil] A hash containing the course and unit group unit,
  #   or `nil` if no valid context is found.
  #   The hash has the following structure:
  #     - `:course` - The given UnitGroup/Course
  #     - `:unit_group_unit` - The UnitGroupUnit for the given Course and position
  #     - `:unit` - The Unit in the given Course and position
  def self.get_unit_context(course_name, unit_position)
    course = UnitGroup.get_from_cache(course_name)
    return nil unless course
    unit_group_unit = UnitGroupUnit.get_with_position_from_cache(course.id, unit_position)
    return nil unless unit_group_unit
    unit = Unit.get_from_cache(unit_group_unit.script_id)
    {course: course, unit_group_unit: unit_group_unit, unit: unit}
  end

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
  #     - `:course` - The retrieved UnitGroup/Course
  #     - `:unit_group_unit` - The associated UnitGroupUnit information
  #     - `:unit` - The Unit for the given `unit_name`
  def self.get_course_context(unit_name)
    unit = Unit.get_from_cache(unit_name, raise_exceptions: false)
    return nil unless unit
    unit_group_unit = unit.unit_group_units&.first
    return nil unless unit_group_unit
    course = UnitGroup.get_from_cache(unit_group_unit.course_id)
    {course: course, unit_group_unit: unit_group_unit, unit: unit}
  end
end

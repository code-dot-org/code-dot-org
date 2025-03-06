class Queries::Courses
  def self.get_course(params)
    course_name = params[:course_course_name]
    return UnitGroup.get_from_cache(course_name) if course_name
  end

  def self.get_unit_position(params)
    return params[:unit_position]
  end

  def self.get_unit(params)
    course = get_course(params)
    unit_position = get_unit_position(params)
    if course && unit_position
      unit_group_unit = UnitGroupUnit.find_by(course_id: @course.id, position: @script_position)
      return Unit.get_from_cache(unit_group_unit.script_id) if unit_group_unit
    end
  end

  # Fetches the course context for a given script name. This is needed because
  # sometimes we need to guess what UnitGroup/Course a Unit/Script is part of
  # because the URL doesn't provide that context.
  #
  # Returns `nil` if the script name does not correspond to a valid Unit,
  # UnitGroupUnit, or UnitGroup/Course.
  #
  # @param script_name [String] The name of the script used to fetch the course context.
  # @return [Hash, nil] A hash containing the course and unit group unit,
  #   or `nil` if no valid course context is found.
  #   The hash has the following structure:
  #     - `:course` - The retrieved Unit/Course
  #     - `:unit_group_unit` - The associated UnitGroupUnit information
  def self.get_course_context(script_name)
    unit = Unit.get_from_cache(script_name)
    return nil unless unit
    unit_group_unit = UnitGroupUnit.where(script_id: unit.id).first
    return nil unless unit_group_unit
    course = UnitGroup.get_from_cache(unit_group_unit.course_id)
    {course: course, unit_group_unit: unit_group_unit}
  end
end

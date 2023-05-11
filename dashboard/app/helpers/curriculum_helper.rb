module CurriculumHelper
  KEY_CHAR_RE = /[A-Za-z0-9\-\_\.]/
  RESERVED_KEYS = ['edit', 'new']

  def validate_key_format
    if RESERVED_KEYS.include?(key)
      errors.add(:base, "Key must not be one of: ${RESERVED_KEYS}")
      return false
    end

    if key.blank?
      errors.add(:base, 'Key must not be blank')
      return false
    end

    if key[0] == '.' || key[-1] == '.'
      errors.add(:base, 'Key cannot start or end with period')
      return false
    end

    key_re = /\A#{KEY_CHAR_RE}+\Z/o
    unless key_re.match?(key)
      errors.add(:base, "must only be letters, numbers, dashes, underscores, and periods. Got ${key}")
      return false
    end
    return true
  end

  # retrieves the matching UnitGroup or Unit associated with a course version and offering
  def self.find_matching_course_version(course_name)
    matching_unit_group = UnitGroup.get_from_cache(course_name)
    return matching_unit_group.course_version if matching_unit_group
    matching_standalone_course = Unit.get_from_cache(course_name, raise_exceptions: false)
    return matching_standalone_course.course_version if matching_standalone_course&.is_course
    return nil
  end
end

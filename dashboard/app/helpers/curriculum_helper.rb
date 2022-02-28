module CurriculumHelper
  KEY_CHAR_RE = /[A-Za-z0-9\-\_\.]/

  def validate_key_format
    if key.blank?
      errors.add(:base, 'Key must not be blank')
      return false
    end

    if key[0] == '.' || key[-1] == '.'
      errors.add(:base, 'Key cannot start or end with period')
      return false
    end

    key_re = /\A#{KEY_CHAR_RE}+\Z/
    unless key_re.match?(key)
      errors.add(:base, "must only be letters, numbers, dashes, underscores, and periods. Got ${key}")
      return false
    end
    return true
  end
end

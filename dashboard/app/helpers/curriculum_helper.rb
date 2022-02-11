module CurriculumHelper
  def key_format
    if key.blank?
      errors.add(:base, 'Key must not be blank')
      return false
    end

    if key[0] == '.' || key[-1] == '.'
      errors.add(:base, 'Key cannot start or end with period')
      return false
    end

    key_char_re = /[A-Za-z0-9\-\_\.]/
    key_re = /\A#{key_char_re}+\Z/
    unless key_re.match?(key)
      errors.add(:base, "must only be letters, numbers, dashes, underscores, and periods. Got ${key}")
      return false
    end
    return true
  end
end

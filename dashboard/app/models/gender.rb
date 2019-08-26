class Gender
  OPTIONS = [
    [nil, ''],
    ['gender.male', 'm'],
    ['gender.female', 'f'],
    ['gender.non_binary', 'n'],
    ['gender.not_listed', 'o'],
    ['gender.none', '-'],
  ].freeze

  def normalize(v)
    return nil if v.blank?
    case v.downcase
    when 'f', 'female'
      'f'
    when 'm', 'male'
      'm'
    when 'o', 'notlisted'
      'o'
    when 'n', 'nonbinary', 'non-binary'
      'n'
    else
      nil
    end
  end
end

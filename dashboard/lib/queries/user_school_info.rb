class Queries::UserSchoolInfo
  def self.last_complete(user)
    return nil unless user

    user.
      user_school_infos.
      includes(:school_info).
      select {|usi| usi.school_info.complete?}.
      max_by(&:created_at)
  end

  # TODO: ACQ-3300 remove when school info has been updated for affected users
  def self.affected_by_missing_nces_schools?(user)
    return false unless user&.teacher?
    user_school_info = last_complete(user)
    school_info = user_school_info&.school_info
    return false unless school_info

    school_info.country == 'US' &&
      school_info.school_type.nil? &&
      school_info.school_id.nil? &&
      school_info.school_name.present? &&
      school_info.updated_at > Date.parse('2025-03-17') &&
      school_info.updated_at < Date.parse('2025-05-07')
  end
end

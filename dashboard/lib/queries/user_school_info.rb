class Queries::UserSchoolInfo
  def self.last_complete(user)
    user.
      user_school_infos.
      includes(:school_info).
      select {|usi| usi.school_info.complete?}.
      sort_by(&:created_at).
      last
  end
end

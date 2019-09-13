class Queries::UserSchoolInfo
  def initialize(scope = UserSchoolInfo.all)
    @scope = scope
  end

  # Most recently created user_school_info referring to a complete
  # school_info entry
  def last_complete
    @scope.
      includes(:school_info).
      select {|usi| usi.school_info.complete?}.
      sort_by(&:created_at).
      last
  end

  def self.by_user(user)
    new(user.user_school_infos)
  end
end

class Queries::SchoolInfo
  def self.last_complete(user)
    Queries::UserSchoolInfo.last_complete(user)&.school_info
  end
end

#
# A set of utilities that provide access to the current user, their
# authentication state, and other DASHBOARD_DB access.
#
module Dashboard

  # Get the dashboard database
  # The static constant is wrapped here so it's easy to stub for tests.
  # @returns [Database]
  def self.db
    DASHBOARD_DB
  end


  def self.admin?(user_id)
    !!db[:users].where(id: user_id, admin: true).first
  end

end
#
# A set of utilities that provide access to the current user, their
# authentication state, and other DASHBOARD_DB access.
#
module DashboardSession

  # Get the dashboard database
  # The static constant is wrapped here so it's easy to stub for tests.
  # @returns [Database]
  def dashboard_db
    DASHBOARD_DB
  end

  # Get the current dashboard user record
  # @returns [Hash]
  def current_user
    @dashboard_user ||= DASHBOARD_DB[:users][id: current_user_id]
  end

  # Get the current dashboard user ID
  # @returns [Integer]
  def current_user_id
    request.user_id
  end

end
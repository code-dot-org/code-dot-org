#
# Utility methods that help middleware access dashboard authentication and
# permissions information.
#
# The use of these methods within shared is deprecated.
# These methods should be eliminated or moved to dashboard.
#

# @returns [Integer] the user_id associated with the current request
def current_user_id
  # @request is a Sinatra::Request < Rack::Request provided by Sinatra::Base
  @request&.user_id
end

# @returns [Hash] the dashboard user row associated with the current request.
def current_user
  return nil if (id = current_user_id).nil?
  # rubocop:disable CustomCops/DashboardDbUsage
  @current_user ||= DASHBOARD_DB[:users][id: id]
  # rubocop:enable CustomCops/DashboardDbUsage
end

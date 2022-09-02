require 'cdo/user_helpers'
require 'json'

#
# Utility methods that help middleware access dashboard authentication and
# permissions information.
#
# Note: This file should be loaded in the context of a Sinatra application;
#       see net_sim_api.rb for an example of this.
#

# @returns [Integer] the user_id associated with the current request
def current_user_id
  # @request is a Sinatra::Request < Rack::Request provided by Sinatra::Base
  @request.nil? ? nil : @request.user_id
end

# @returns [Hash] the dashboard user row associated with the current request.
def current_user
  return nil if (id = current_user_id).nil?
  @dashboard_user ||= DASHBOARD_DB[:users][id: id]
end

# @returns [Boolean] true if the current user is an admin.
def admin?
  current_user && !!current_user[:admin]
end

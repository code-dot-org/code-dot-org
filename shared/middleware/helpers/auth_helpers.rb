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

# @returns [User] the dashboard user associated with the current request.
def current_user
  nil if current_user_id.nil?
  @dashboard_user ||= DASHBOARD_DB[:users][id: current_user_id]
end

# @returns [Boolean] true if the current user is an admin.
def admin?
  current_user && !!current_user[:admin]
end

# @param [Integer] section_id
# @returns [Boolean] true iff the current user is the owner of the given section.
#          Note: NOT always true for admins.
def owns_section?(section_id)
  return false unless section_id && current_user_id
  DASHBOARD_DB[:sections].where(id: section_id, user_id: current_user_id).any?
end

# @param [Integer] student_id
# @returns [Boolean] true iff the current user is the teacher for the student of the given id
def teaches_student?(student_id)
  return false unless student_id && current_user_id
  DASHBOARD_DB[:followers].where(user_id: current_user_id, student_user_id: student_id).any?
end

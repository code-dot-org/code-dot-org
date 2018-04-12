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
  nil if current_user_id.nil?
  @dashboard_user ||= DASHBOARD_DB[:users][id: current_user_id]
end

# Returns true if the current user is under 13 or if age is unknown.
# Duplicates User#under_13? without using the rails model.
def under_13?
  return true unless current_user
  birthday = current_user[:birthday]
  age = UserHelpers.age_from_birthday(birthday)
  age < 13
end

# Returns the sharing_disabled property of a user with a given user_id,
# always defaulting sharing to enabled.
def get_user_sharing_disabled(user_id)
  user_properties = DASHBOARD_DB[:users].select(:properties).first(id: user_id)
  return false unless user_properties
  get_sharing_disabled_from_properties(user_properties[:properties])
end

def get_sharing_disabled_from_properties(properties)
  return false unless properties
  parsed_properties = JSON.parse(properties)
  !!parsed_properties["sharing_disabled"]
end

# @returns [Boolean] true if the current user is an admin.
def admin?
  current_user && !!current_user[:admin]
end

# @param [String] permission - Name of the permission we're interested in
# @returns [Boolean] true if the current user has the specified dashboard permission
def has_permission?(permission)
  return false unless current_user

  if @user_permissions.nil?
    @user_permissions = DASHBOARD_DB[:user_permissions].where(user_id: current_user_id).pluck(:permission)
  end
  @user_permissions.include? permission
end

# @param [Integer] section_id
# @returns [Boolean] true iff the current user is the owner of the given section.
#          Note: NOT always true for admins.
def owns_section?(section_id)
  return false unless section_id && current_user_id
  DASHBOARD_DB[:sections].where(id: section_id, user_id: current_user_id).any?
end

# @param [Integer] student_id
# @returns [Boolean] true iff the current user, or given user, is the teacher for the student of the given id
def teaches_student?(student_id, user_id = current_user_id)
  return false unless student_id && user_id
  DASHBOARD_DB[:sections].
      join(:followers, section_id: :sections__id).
      join(:users, id: :followers__student_user_id).
      where(sections__user_id: user_id, sections__deleted_at: nil).
      where(followers__student_user_id: student_id, followers__deleted_at: nil).
      where(users__deleted_at: nil).
      any?
end

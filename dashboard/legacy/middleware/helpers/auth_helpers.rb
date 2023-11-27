require_relative 'user_helpers'
require 'json'
require 'helpers/shared_auth_helpers'

#
# Utility methods that help middleware access dashboard authentication and
# permissions information.
#
# Note: This file should be loaded in the context of a Sinatra application;
#       see net_sim_api.rb for an example of this.
#

# Consider the age of the specified user if user_id is provided, or of the
# current user otherwise.
# Returns true if the user is under 13 or if age is unknown.
# Duplicates User#under_13? without using the rails model.
def under_13?(user_id)
  user = user_id ? DASHBOARD_DB[:users].select(:birthday).first(id: user_id) : current_user
  return true unless user
  birthday = user[:birthday]
  age = UserHelpers.age_from_birthday(birthday)
  age < 13
end

def sharing_disabled?
  return false unless current_user
  get_sharing_disabled_from_properties(current_user[:properties])
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
# @returns [Boolean] true if the current user is the owner of the given section.
#          Note: NOT always true for admins.
def owns_section?(section_id)
  return false unless section_id && current_user_id
  DASHBOARD_DB[:sections].where(id: section_id, user_id: current_user_id).any?
end

# @param [Integer] student_id
# @returns [Boolean] true if the current user, or given user, is the teacher for the student of the given id
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

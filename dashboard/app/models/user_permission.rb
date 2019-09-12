# == Schema Information
#
# Table name: user_permissions
#
#  id         :integer          not null, primary key
#  user_id    :integer          not null
#  permission :string(255)      not null
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_user_permissions_on_user_id_and_permission  (user_id,permission) UNIQUE
#

require 'cdo/chat_client'

class UserPermission < ActiveRecord::Base
  belongs_to :user

  VALID_PERMISSIONS = [
    # Grants access to managing workshops and workshop attendance.
    FACILITATOR = 'facilitator'.freeze,
    # Grants access to viewing hidden scripts.
    HIDDEN_SCRIPT_ACCESS = 'hidden_script_access'.freeze,
    # Grants access to managing (e.g., editing) levels, stages, scripts, etc.
    # Also grants access to viewing extra links related to editing these.
    # Also makes the account satisfy authorized_teacher?.
    LEVELBUILDER = 'levelbuilder'.freeze,
    # Grants ability to (un)feature projects in the the public project gallery.
    # Also, grants access to resetting (to 0) the abuse score for projects,
    # and blocking and unblocking legacy shares (formerly RESET_ABUSE).
    PROJECT_VALIDATOR = 'project_validator'.freeze,
    # Grants access to PLC workshop dashboards.
    WORKSHOP_ADMIN = 'workshop_admin'.freeze,
    # Grants access to managing professional development workshops and
    # professional development workshop attendance.
    WORKSHOP_ORGANIZER = 'workshop_organizer'.freeze,
    # Grants ability to conduct peer reviews for professional learning courses
    PLC_REVIEWER = 'plc_reviewer'.freeze,
    # Grants ability to view teacher markdown and level examples.
    # Also prevents account from being locked
    AUTHORIZED_TEACHER = 'authorized_teacher'.freeze,
    # Granted to regional partner program managers.
    # Initially has the same abilities as workshop organizer.
    PROGRAM_MANAGER = 'program_manager'.freeze,
    # Grants access to review reported inaccuracies in census data
    CENSUS_REVIEWER = 'census_reviewer'.freeze,
  ].freeze

  # Do not log the granting/removal of these permissions to slack
  SILENCED_PERMISSIONS = [
    AUTHORIZED_TEACHER,
  ].freeze

  ASSIGNABLE_PERMISSIONS = (VALID_PERMISSIONS - [WORKSHOP_ORGANIZER]).freeze

  validates_inclusion_of :permission, in: VALID_PERMISSIONS

  after_save :log_permission_save
  before_destroy :log_permission_delete

  def log_permission_save
    return if changed_attributes.empty?

    # In particular, we do not log for adhoc or test environments.
    return unless UserPermission.should_log?

    # Do not log certain common and fairly harmless permissions
    return if SILENCED_PERMISSIONS.include? permission

    ChatClient.message 'infra-security',
      'Updating UserPermission: '\
        "environment: #{rack_env}, "\
        "user ID: #{user.id}, "\
        "email: #{user.email}, "\
        "permission: #{permission}",
      color: 'yellow'
  end

  def log_permission_delete
    # In particular, we do not log for adhoc or test environments.
    return unless UserPermission.should_log?

    # Do not log certain common and fairly harmless permissions
    return if SILENCED_PERMISSIONS.include? permission

    ChatClient.message 'infra-security',
      'Deleting UserPermission: '\
        "environment: #{rack_env}, "\
        "user ID: #{user.id}, "\
        "email: #{user.email}, "\
        "permission: #{permission}",
      color: 'yellow'
  end

  def self.should_log?
    [:staging, :levelbuilder, :production].include? rack_env
  end
end

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

class UserPermission < ActiveRecord::Base
  # Grants access to viewing all workshops in all cohorts in their district.
  DISTRICT_CONTACT = 'district_contact'

  # Grants access to managing workshops and workshop attendance.
  FACILITATOR = 'facilitator'

  # Grants access to viewing hidden scripts.
  HIDDEN_SCRIPT_ACCESS = 'hidden_script_access'

  # Grants access to managing (e.g., editing) LevelSourceHint's and
  # FrequentUnsuccessfulLevelSource's.
  # TODO(asher): Deprecate this permission.
  HINT_ACCESS = 'hint_access'

  # Grants access to managing (e.g., editing) levels, stages, scripts, etc.
  # Also grants access to viewing extra links related to editing these.
  # Also makes the account satisfy authorized_teacher?.
  LEVELBUILDER = 'levelbuilder'

  # Grants access to reseting (to 0) the abuse score for projects.
  RESET_ABUSE = 'reset_abuse'

  # Grants access to managing professional development workshops and
  # professional development workshop attendance.
  WORKSHOP_ORGANIZER = 'workshop_organizer'
end

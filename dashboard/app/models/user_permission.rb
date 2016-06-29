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
  DISTRICT_CONTACT = 'district_contact'.freeze
  FACILITATOR = 'facilitator'.freeze
  HINT_ACCESS = 'hint_access'.freeze
  LEVELBUILDER = 'levelbuilder'.freeze
  WORKSHOP_ORGANIZER = 'workshop_organizer'.freeze
end

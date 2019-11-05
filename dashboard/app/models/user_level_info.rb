# == Schema Information
#
# Table name: user_level_infos
#
#  id            :integer          not null, primary key
#  time_spent    :integer          default(0)
#  user_level_id :integer          unsigned
#
# Indexes
#
#  index_user_level_infos_on_user_level_id  (user_level_id) UNIQUE
#

class UserLevelInfo < ApplicationRecord
end

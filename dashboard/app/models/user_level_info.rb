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

# This model is meant to support the UserLevel model. The UserLevel table has gotten
# too large and adding new columns to it can cause problems with production so we created
# this model in order to store further information about a UserLevel.

class UserLevelInfo < ApplicationRecord
end

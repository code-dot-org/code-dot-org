# == Schema Information
#
# Table name: validated_user_levels
#
#  id            :integer          not null, primary key
#  time_spent    :integer          default(0)
#  user_level_id :integer          unsigned
#
# Indexes
#
#  index_validated_user_levels_on_user_level_id  (user_level_id) UNIQUE
#

class ValidatedUserLevel < ApplicationRecord
end

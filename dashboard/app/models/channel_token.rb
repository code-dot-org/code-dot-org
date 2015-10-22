# == Schema Information
#
# Table name: channel_tokens
#
#  id         :integer          not null, primary key
#  channel    :string(255)      not null
#  user_id    :integer          not null
#  level_id   :integer          not null
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_channel_tokens_on_user_id_and_level_id  (user_id,level_id) UNIQUE
#

class ChannelToken < ActiveRecord::Base
  belongs_to :user
  belongs_to :level
end

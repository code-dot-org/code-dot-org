# == Schema Information
#
# Table name: backpacks
#
#  id               :bigint           not null, primary key
#  user_id          :integer          not null
#  channel_token_id :integer          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_backpacks_on_user_id  (user_id)
#
class Backpack < ApplicationRecord
end

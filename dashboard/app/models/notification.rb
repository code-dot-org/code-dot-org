# == Schema Information
#
# Table name: notifications
#
#  id         :bigint           not null, primary key
#  user_id    :integer          not null
#  message    :string(255)      not null
#  source     :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_notifications_on_user_id  (user_id)
#
class Notification < ApplicationRecord
  belongs_to :user
end

# == Schema Information
#
# Table name: cap_user_events
#
#  id         :bigint           not null, primary key
#  name       :string(64)       not null
#  user_id    :integer          not null
#  policy     :string(16)       not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_cap_user_events_on_name_and_policy  (name,policy)
#  index_cap_user_events_on_policy           (policy)
#  index_cap_user_events_on_user_id          (user_id)
#
class CapUserEvent < ApplicationRecord
  belongs_to :user
end

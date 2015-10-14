# == Schema Information
#
# Table name: hint_view_requests
#
#  id              :integer          not null, primary key
#  user_id         :integer
#  script_level_id :integer
#  feedback_type   :integer
#  feedback_xml    :string(255)
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_hint_view_requests_on_script_level_id  (script_level_id)
#  index_hint_view_requests_on_user_id          (user_id)
#

class HintViewRequest < ActiveRecord::Base
  belongs_to :user
  belongs_to :script_level
end

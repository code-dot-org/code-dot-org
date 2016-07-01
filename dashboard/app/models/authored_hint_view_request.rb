# == Schema Information
#
# Table name: authored_hint_view_requests
#
#  id                    :integer          not null, primary key
#  user_id               :integer
#  script_id             :integer
#  level_id              :integer
#  hint_id               :string(255)
#  hint_class            :string(255)
#  hint_type             :string(255)
#  prev_time             :integer
#  prev_attempt          :integer
#  prev_test_result      :integer
#  prev_activity_id      :integer
#  prev_level_source_id  :integer
#  next_time             :integer
#  next_attempt          :integer
#  next_test_result      :integer
#  next_activity_id      :integer
#  next_level_source_id  :integer
#  final_time            :integer
#  final_attempt         :integer
#  final_test_result     :integer
#  final_activity_id     :integer
#  final_level_source_id :integer
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#
# Indexes
#
#  fk_rails_8f51960e09                                          (level_id)
#  index_authored_hint_view_requests_on_all_related_ids         (user_id,script_id,level_id,hint_id)
#  index_authored_hint_view_requests_on_script_id_and_level_id  (script_id,level_id)
#  index_authored_hint_view_requests_on_user_id                 (user_id)
#

require 'dynamic_config/gatekeeper'

class AuthoredHintViewRequest < ActiveRecord::Base
  belongs_to :user
  belongs_to :script
  belongs_to :level

  validates :script, :presence => true
  validates :level, :presence => true

  def self.enabled?(script = nil)
    if script
      Gatekeeper.allows('authored_hint_view_request', where: { script_name: script.name }, default: true)
    else
      Gatekeeper.allows('authored_hint_view_request', default: true)
    end
  end
end

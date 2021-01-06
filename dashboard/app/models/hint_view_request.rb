# == Schema Information
#
# Table name: hint_view_requests
#
#  id            :integer          not null, primary key
#  user_id       :integer
#  script_id     :integer
#  level_id      :integer
#  feedback_type :integer
#  feedback_xml  :text(65535)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_hint_view_requests_on_script_id_and_level_id  (script_id,level_id)
#  index_hint_view_requests_on_user_id                 (user_id)
#
require 'dynamic_config/gatekeeper'

class HintViewRequest < ApplicationRecord
  belongs_to :user
  belongs_to :script
  belongs_to :level

  validates :user, presence: true
  validates :script, presence: true
  validates :level, presence: true

  include HintsUsed

  def self.enabled?
    Gatekeeper.allows('hint_view_request', default: true)
  end

  # Returns an array of serializable hashes representing all of a given
  # user's hint view requests for a given script and level
  # called by ApplicationController.milestone_response
  # used by Studio's feedback modal to decide whether or not to show a
  # user a hint based on the already-viewed hints.
  def self.milestone_response(script, level, user)
    return [] unless enabled?
    HintViewRequest.
      where(user: user, script: script, level: level).
      pluck(:feedback_type, :feedback_xml).
      map do |feedback_type, feedback_xml|
        {feedback_type: feedback_type, feedback_xml: feedback_xml}
      end
  end
end

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

  # Returns an array of serializable hashes representing all of a given
  # user's hint view requests for a given script_level
  # called by ApplicationController.milestone_response
  # used by Studio's feedback modal to decide whether or not to show a
  # user a hint based on the already-viewed hints.
  def HintViewRequest.milestone_response(script_level, user)
    return HintViewRequest.where(script_level: script_level, user: user).find_each.map do |hint_view_request|
      hint_view_request.serializable_hash(only: [:feedback_type, :feedback_xml])
    end
  end

end

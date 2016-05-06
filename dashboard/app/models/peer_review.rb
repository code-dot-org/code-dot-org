# == Schema Information
#
# Table name: peer_reviews
#
#  id              :integer          not null, primary key
#  user_id         :integer
#  from_instructor :boolean          default(FALSE), not null
#  script_id       :integer          not null
#  level_id        :integer          not null
#  level_source_id :integer          not null
#  data            :text(65535)
#  status          :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_peer_reviews_on_level_id         (level_id)
#  index_peer_reviews_on_level_source_id  (level_source_id)
#  index_peer_reviews_on_script_id        (script_id)
#  index_peer_reviews_on_user_id          (user_id)
#

class PeerReview < ActiveRecord::Base
  belongs_to :user
  belongs_to :script
  belongs_to :level
  belongs_to :level_source

  REVIEWS_PER_SUBMISSION = 2

  def self.create_for_submission(user_level, level_source_id, from_instructor = false)
    REVIEWS_PER_SUBMISSION.times do
      create!(
        user: user_level.user,
        from_instructor: from_instructor,
        script: user_level.script,
        level: user_level.level,
        level_source_id: level_source_id
      )
    end
  end
end

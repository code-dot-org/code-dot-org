class PeerReview < ActiveRecord::Base
  belongs_to :user
  belongs_to :script
  belongs_to :level
  belongs_to :level_source
end

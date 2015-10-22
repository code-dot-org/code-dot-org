# == Schema Information
#
# Table name: puzzle_ratings
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  script_id  :integer
#  level_id   :integer
#  rating     :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_puzzle_ratings_on_script_id_and_level_id              (script_id,level_id)
#  index_puzzle_ratings_on_user_id                             (user_id)
#  index_puzzle_ratings_on_user_id_and_script_id_and_level_id  (user_id,script_id,level_id) UNIQUE
#

class PuzzleRating < ActiveRecord::Base
  belongs_to :user
  belongs_to :script
  belongs_to :level

  validates :user, :presence => true
  validates :script, :presence => true
  validates :level, :presence => true

  validates_uniqueness_of :user_id, :scope => [:script_id, :level_id]

  def PuzzleRating.enabled?
    true
  end

  def PuzzleRating.can_rate?(*args, &block)
    enabled? ? !PuzzleRating.exists?(*args, &block) : false
  end
end

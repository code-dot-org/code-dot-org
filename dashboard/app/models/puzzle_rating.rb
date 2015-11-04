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
#  index_puzzle_ratings_on_user_id_and_script_id_and_level_id  (user_id,script_id,level_id) UNIQUE
#
require 'dynamic_config/gatekeeper'

class PuzzleRating < ActiveRecord::Base
  belongs_to :user
  belongs_to :script
  belongs_to :level

  validates :script, :presence => true
  validates :level, :presence => true
  validates :rating, :numericality => { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 1 }

  validates_uniqueness_of :user_id, :scope => [:script_id, :level_id], :allow_nil => true

  def PuzzleRating.enabled?
    Gatekeeper.allows('puzzle_rating', default: true)
  end

  # If PuzzleRating is disabled, no one can rate
  # If the user is not logged in, they can always rate
  # If the user is logged in, they can only rate if
  #   they haven't rated before
  def PuzzleRating.can_rate?(script, level, user)
    return false unless enabled?
    return true unless user
    !PuzzleRating.exists?(script: script, level: level, user: user)
  end
end

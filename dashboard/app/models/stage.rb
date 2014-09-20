# Ordered partitioning of script levels within a script
# (Intended to replace most of the functionality in Game, due to the need for multiple app types within a single Game/Stage)
class Stage < ActiveRecord::Base
  has_many :script_levels, -> { order('position ASC') }
  belongs_to :script
  acts_as_list scope: :script

  validates_uniqueness_of :name, scope: :script_id

  def to_param
    position.to_s
  end

  def unplugged?
    return false unless script_levels.first
    script_levels.first.level.unplugged?
  end
end

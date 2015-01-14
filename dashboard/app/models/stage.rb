# Ordered partitioning of script levels within a script
# (Intended to replace most of the functionality in Game, due to the need for multiple app types within a single Game/Stage)
class Stage < ActiveRecord::Base
  has_many :script_levels, -> { order('position ASC') }, inverse_of: :stage
  belongs_to :script, inverse_of: :stages
  acts_as_list scope: :script

  validates_uniqueness_of :name, scope: :script_id

  def to_param
    position.to_s
  end

  def cached_unplugged?
    script_levels = Script.get_from_cache(self.script.name).script_levels.select{|sl| sl.stage_id == self.id}
    return false unless script_levels.first
    return script_levels.first.level.unplugged?
  end

  def unplugged?
    if script.should_be_cached?
      cached_unplugged?
    else
      return false unless script_levels.first
      script_levels.first.level.unplugged?
    end
  end
end

# Ordered partitioning of script levels within a script
# (Intended to replace most of the functionality in Game, due to the need for multiple app types within a single Game/Stage)
class Stage < ActiveRecord::Base
  include Cached
  has_many :script_levels, -> { order('position ASC') }
  belongs_to :script, :touch => true
  acts_as_list scope: :script

  validates_uniqueness_of :name, scope: :script_id

  def to_param
    position.to_s
  end

  def script
    Script.get_from_cache(script_id)
  end

  def get_cached
    script.get_stage_by_id(self.id)
  end

  def unplugged?
    cached(:stage_unplugged) do
      if script_levels.first
        script_levels.first.level.unplugged?
      else
        false
      end
    end
  end
end

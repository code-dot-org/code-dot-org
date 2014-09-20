# A "hint" text displayed for a specific LevelSource to guide the player to a solution
class LevelSourceHint < ActiveRecord::Base
  belongs_to :level_source
  has_many :activity_hints
  after_initialize :init

  STATUS_SELECTED = 'selected'
  STATUS_EXPERIMENT = 'experiment'
  STATUS_INACTIVE = 'inactive'
  STATUS_NEW = 'new'

  USER_VISIBLE_NAMES = {
      STATUS_SELECTED => 'approved',
      STATUS_EXPERIMENT => 'experimental',
      STATUS_INACTIVE => 'rejected',
      STATUS_NEW => 'new'
  }

  def init
    self.status ||= STATUS_NEW
  end

  # Values for self.source.
  CROWDSOURCED = 'crowdsourced'
  STANFORD = 'Stanford bestPath1'

  def selected?
    self.status == STATUS_SELECTED
  end

  def experiment?
    self.status == STATUS_EXPERIMENT
  end

  def inactive?
    self.status == STATUS_INACTIVE
  end

  def approved?
    self.selected? || self.experiment?
  end
end

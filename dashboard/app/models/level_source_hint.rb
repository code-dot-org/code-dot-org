# == Schema Information
#
# Table name: level_source_hints
#
#  id              :integer          not null, primary key
#  level_source_id :integer
#  hint            :text(65535)
#  times_proposed  :integer
#  priority        :float(24)
#  created_at      :datetime
#  updated_at      :datetime
#  user_id         :integer
#  status          :string(255)
#  source          :string(255)
#
# Indexes
#
#  index_level_source_hints_on_level_source_id  (level_source_id)
#

# A "hint" text displayed for a specific LevelSource to guide the player to a solution
class LevelSourceHint < ActiveRecord::Base
  belongs_to :level_source
  has_many :activity_hints
  after_initialize :init

  STATUS_SELECTED = 'selected'.freeze
  STATUS_EXPERIMENT = 'experiment'.freeze
  STATUS_INACTIVE = 'inactive'.freeze
  STATUS_NEW = 'new'.freeze

  USER_VISIBLE_NAMES = {
      STATUS_SELECTED => 'approved',
      STATUS_EXPERIMENT => 'experimental',
      STATUS_INACTIVE => 'rejected',
      STATUS_NEW => 'new'
  }.freeze

  def init
    self.status ||= STATUS_NEW
  end

  # Values for self.source.
  CROWDSOURCED = 'crowdsourced'.freeze
  STANFORD = 'Stanford bestPath1'.freeze

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

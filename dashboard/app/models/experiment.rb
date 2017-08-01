# == Schema Information
#
# Table name: experiments
#
#  id                   :integer          not null, primary key
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  name                 :string(255)      not null
#  type                 :string(255)      not null
#  start_at             :datetime
#  end_at               :datetime
#  section_id           :integer
#  min_user_id          :integer
#  max_user_id          :integer
#  overflow_max_user_id :integer
#  earliest_section_at  :datetime
#  latest_section_at    :datetime
#  script_id            :integer
#
# Indexes
#
#  index_experiments_on_max_user_id           (max_user_id)
#  index_experiments_on_min_user_id           (min_user_id)
#  index_experiments_on_overflow_max_user_id  (overflow_max_user_id)
#  index_experiments_on_section_id            (section_id)
#

MAX_CACHE_AGE = 1.minute

class Experiment < ApplicationRecord
  belongs_to :script, optional: true

  validates :name, presence: true
  after_create {Experiment.update_cache}

  @@experiments = nil

  def self.get_all_enabled(user: nil, section: nil, script: nil, experiment_name: nil)
    if @@experiments.nil? || @@experiments_loaded < DateTime.now - MAX_CACHE_AGE
      update_cache
    end
    now = DateTime.now
    @@experiments.select do |experiment|
      experiment.enabled?(user: user, section: section) &&
        (experiment.start_at.nil? || experiment.start_at < now) &&
        (experiment.end_at.nil? || experiment.end_at > now) &&
        (experiment.script_id.nil? || experiment.script_id == script.try(:id)) &&
        (experiment_name.nil? || experiment.name == experiment_name)
    end
  end

  def self.enabled?(user: nil, section: nil, script: nil, experiment_name: nil)
    !get_all_enabled(
      user: user,
      section: section,
      script: script,
      experiment_name: experiment_name
    ).empty?
  end

  def self.update_cache
    @@experiments = Experiment.all.to_a
    @@experiments_loaded = DateTime.now
  end

  def percentage
    return nil unless max_user_id && min_user_id
    max_user_id - min_user_id
  end

  def percentage=(val)
    self.min_user_id = Digest::SHA1.hexdigest(name)[0..9].to_i(16) % 100
    self.max_user_id = min_user_id + val
    if max_user_id > 100
      self.overflow_max_user_id = max_user_id - 100
      self.max_user_id = 100
    else
      self.overflow_max_user_id = 0
    end
  end
end

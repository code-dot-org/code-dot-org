# == Schema Information
#
# Table name: experiments
#
#  id                     :integer          not null, primary key
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  name                   :string(255)      not null
#  type                   :string(255)      not null
#  start_time             :datetime
#  end_time               :datetime
#  section_id             :integer
#  percentage             :integer
#  earliest_section_start :datetime
#  latest_section_start   :datetime
#  script_id              :integer
#

MAX_CACHE_AGE = 1.minutes

class Experiment < ApplicationRecord
  belongs_to :script, optional: true

  validates :name, presence: true
  after_create {Experiment.update_cache}

  @@experiments = nil

  def self.should_cache?
    Script.should_cache?
  end

  def self.get_all_enabled(user: nil, section: nil, script: nil)
    if Experiment.should_cache?
      Experiment.get_all_enabled_cached(user: user, section: section, script: script)
    else
      Experiment.get_all_enabled_uncached(user: user, section: section, script: script)
    end
  end

  def self.get_all_enabled_uncached(user: nil, section: nil, script: nil)
    experiments = Experiment.descendants.map do |experiment_type|
      experiment_type.get_enabled(user: user, section: section, script: script)
    end
    experiments = experiments.reduce(Experiment.none) do |e1, e2|
      e1.or(e2)
    end
    now = DateTime.now
    experiments.where('start_time IS NULL OR start_time < ?', now).
      where('end_time IS NULL OR end_time > ?', now).
      where('script_id IS NULL OR script_id = ?', script.try(:id))
  end

  def self.get_all_enabled_cached(user: nil, section: nil, script: nil)
    if @@experiments.nil? || @@experiments_loaded < DateTime.now - MAX_CACHE_AGE
      Experiment.update_cache
    end
    now = DateTime.now
    @@experiments.select do |experiment|
      experiment.enabled?(user: user, section: section) &&
        (experiment.start_time.nil? || experiment.start_time < now) &&
        (experiment.end_time.nil? || experiment.end_time > now) &&
        (experiment.script_id.nil? || experiment.script_id == script.try(:id))
    end
  end

  def self.update_cache
    return unless Experiment.should_cache?
    @@experiments = Experiment.all.to_a
    @@experiments_loaded = DateTime.now
  end

  def id_offset
    Digest::SHA1.hexdigest(name)[0..9].to_i(16) % 100
  end
end

# Ensure all the subclasses are loaded so that Experiment.descendants above
# returns all experiment types. Classes are eager loaded in production anyway,
# but not in development.
require_dependency 'user_based_experiment'
require_dependency 'teacher_based_experiment'
require_dependency 'single_section_experiment'

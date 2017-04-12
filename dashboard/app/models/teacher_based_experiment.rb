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

class TeacherBasedExperiment < Experiment
  validates :percentage, inclusion: 0..100

  def self.get_enabled(user: nil, section: nil, script: nil)
    return Experiment.none unless section
    user_id = section.user_id % 100
    Experiment.where(type: TeacherBasedExperiment.to_s).
      where('(? >= min_user_id AND ? < max_user_id) OR (? < overflow_max_user_id)',
        user_id, user_id, user_id
      ).where('earliest_section_at IS NULL OR earliest_section_at < ?', section.first_activity_at).
      where('latest_section_at IS NULL OR latest_section_at > ?', section.first_activity_at)
  end

  def enabled?(user: nil, section: nil)
    return false unless section

    user_id = section.user_id % 100
    return ((user_id >= min_user_id && user_id < max_user_id) ||
        user_id < overflow_max_user_id) &&
      (earliest_section_at.nil? ||
        earliest_section_at < section.first_activity_at) &&
      (latest_section_at.nil? ||
        latest_section_at > section.first_activity_at)
  end
end

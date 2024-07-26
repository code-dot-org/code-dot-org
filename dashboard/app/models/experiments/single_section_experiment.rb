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
#  index_experiments_on_end_at                (end_at)
#  index_experiments_on_max_user_id           (max_user_id)
#  index_experiments_on_min_user_id           (min_user_id)
#  index_experiments_on_overflow_max_user_id  (overflow_max_user_id)
#  index_experiments_on_section_id            (section_id)
#  index_experiments_on_start_at              (start_at)
#

class SingleSectionExperiment < Experiment
  belongs_to :section, optional: true

  # requiring this mitigates performance problems when calling Experiment.get_all_enabled on hot codepaths
  belongs_to :script, class_name: 'Unit'

  # set a limit on the total number of SingleSectionExperiment records, to mitigate performance problems
  # when calling Experiment.get_all_enabled on hot codepaths
  MAX_COUNT = 2_000

  def max_count
    MAX_COUNT
  end

  validate :validate_max_count, on: :create

  def validate_max_count
    errors.add(:base, "cannot have more than #{max_count} records") unless SingleSectionExperiment.count < max_count
  end

  def enabled?(user: nil)
    return false unless user

    user.sections_instructed.include?(section) || user.sections_as_student.include?(section)
  end
end

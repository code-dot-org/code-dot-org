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

class TeacherBasedExperiment < Experiment
  validates :percentage, inclusion: 0..100

  # NOTE: The min_user_id value is inclusive, the max_user_id value is exclusive.
  def enabled?(user: nil, section: nil)
    is_teacher = user.try(:teacher?)
    return false unless section || is_teacher

    if is_teacher
      user_id = user.id
      sections = user.sections
    else
      user_id = section.user_id
      sections = [section]
    end
    user_id_modulus = user_id % 100

    return ((user_id_modulus >= min_user_id && user_id_modulus < max_user_id) ||
        user_id_modulus < overflow_max_user_id) &&
      sections.any? do |s|
        (earliest_section_at.nil? || s.first_activity_at.nil? ||
          earliest_section_at < s.first_activity_at) &&
        (latest_section_at.nil? ||
           (s.first_activity_at && latest_section_at > s.first_activity_at))
      end
  end
end

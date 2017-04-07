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
#

class TeacherBasedExperiment < Experiment
  validates :percentage, inclusion: 0..100

  def self.get_enabled(user: nil, section: nil)
    return Experiment.none unless section
    Experiment.where(type: TeacherBasedExperiment.to_s).
      where('percentage > (? + CONV(SUBSTRING(SHA1(name), 1, 10), 16, 10)) % 100', section.user_id).
      where('earliest_section_start IS NULL OR earliest_section_start < ?', section.first_activity_at).
      where('latest_section_start IS NULL OR latest_section_start > ?', section.first_activity_at)
  end

  def enabled?(user: nil, section: nil)
    return false unless section
    return percentage > (section.user_id + id_offset) % 100 &&
      (earliest_section_start.nil? ||
        earliest_section_start < section.first_activity_at) &&
      (latest_section_start.nil? ||
        latest_section_start > section.first_activity_at)
  end
end

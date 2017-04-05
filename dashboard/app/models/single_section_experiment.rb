# == Schema Information
#
# Table name: experiments
#
#  id                     :integer          not null, primary key
#  name                   :string(255)
#  type                   :string(255)
#  start_time             :datetime
#  end_time               :datetime
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  percentage             :integer
#  earliest_section_start :datetime
#  latest_section_start   :datetime
#  section_id             :integer
#

class SingleSectionExperiment < Experiment
  def self.get_enabled(user: nil, section: nil)
    return Experiment.none unless section
    Experiment.where(type: SingleSectionExperiment.to_s).
      where(section_id: section.id)
  end

  def enabled?(user: nil, section: nil)
    return !section.nil? && section_id == section.id
  end
end

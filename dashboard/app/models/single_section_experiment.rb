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

class SingleSectionExperiment < Experiment
  belongs_to :section

  def self.get_enabled(user: nil, section: nil, script: nil)
    return Experiment.none unless section
    Experiment.where(type: SingleSectionExperiment.to_s).
      where(section_id: section.id)
  end

  def enabled?(user: nil, section: nil)
    return !section.nil? && section_id == section.id
  end
end

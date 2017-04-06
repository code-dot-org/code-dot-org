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

class UserBasedExperiment < Experiment
  def self.get_enabled(user: nil, section: nil)
    return Experiment.none unless user
    Experiment.where(type: UserBasedExperiment.to_s).
      where('percentage > ?', user.id % 100)
  end

  def enabled?(user: nil, section: nil)
    return !user.nil? && percentage > user.id % 100
  end
end

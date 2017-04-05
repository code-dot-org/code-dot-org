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

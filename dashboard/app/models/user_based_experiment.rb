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
      where('percentage > (? + CONV(SUBSTRING(SHA1(name), 1, 10), 16, 10)) % 100', user.id)
  end

  def enabled?(user: nil, section: nil)
    return !user.nil? && percentage > (user.id + id_offset) % 100
  end
end

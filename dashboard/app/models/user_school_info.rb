# == Schema Information
#
# Table name: user_school_infos
#
#  id                     :integer          not null, primary key
#  user_id                :integer          not null
#  start_date             :datetime         not null
#  end_date               :datetime
#  school_info_id         :integer          not null
#  last_confirmation_date :datetime         not null
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#

class UserSchoolInfo < ApplicationRecord
  validates_presence_of :user
  validates_presence_of :school_info
end

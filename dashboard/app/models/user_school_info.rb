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
# Indexes
#
#  index_user_school_infos_on_user_id  (user_id)
#

class UserSchoolInfo < ApplicationRecord
  validates_presence_of :user, :school_info_id, :start_date, :last_confirmation_date

  belongs_to :user
  belongs_to :school_info
end

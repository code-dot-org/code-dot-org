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
  export_to_analytics

  data_classification(
    id: :public,
    user_id: :public,
    start_date: :restricted,
    end_date: :restricted,
    school_info_id: :public,
    last_confirmation_date: :restricted,
    created_at: :public,
    updated_at: :public,
  )

  validates_presence_of :start_date, :last_confirmation_date

  belongs_to :user
  belongs_to :school_info
end

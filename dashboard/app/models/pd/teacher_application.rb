# == Schema Information
#
# Table name: pd_teacher_applications
#
#  id             :integer          not null, primary key
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  user_id        :integer          not null
#  personal_email :string(255)      not null
#  school_email   :string(255)      not null
#  application    :json             not null
#
# Indexes
#
#  index_pd_teacher_applications_on_personal_email  (personal_email)
#  index_pd_teacher_applications_on_school_email    (school_email)
#  index_pd_teacher_applications_on_user_id         (user_id) UNIQUE
#

class Pd::TeacherApplication < ActiveRecord::Base
  belongs_to :user
end

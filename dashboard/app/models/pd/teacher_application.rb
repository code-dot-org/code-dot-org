# == Schema Information
#
# Table name: pd_teacher_applications
#
#  id              :integer          not null, primary key
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  user_id         :integer          not null
#  primary_email   :string(255)      not null
#  secondary_email :string(255)      not null
#  application     :text(65535)      not null
#
# Indexes
#
#  index_pd_teacher_applications_on_primary_email    (primary_email)
#  index_pd_teacher_applications_on_secondary_email  (secondary_email)
#  index_pd_teacher_applications_on_user_id          (user_id) UNIQUE
#

class Pd::TeacherApplication < ActiveRecord::Base
  belongs_to :user

  validates_presence_of :user
  validates_presence_of :primary_email
  validates_presence_of :secondary_email
  validates_email_format_of :primary_email, allow_blank: true
  validates_email_format_of :secondary_email, allow_blank: true
  validates_presence_of :application
end

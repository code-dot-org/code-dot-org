# == Schema Information
#
# Table name: pd_enrollment_notifications
#
#  id               :integer          not null, primary key
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  pd_enrollment_id :integer          not null
#  name             :string(255)
#
# Indexes
#
#  index_pd_enrollment_notifications_on_pd_enrollment_id  (pd_enrollment_id)
#

class Pd::EnrollmentNotification < ApplicationRecord
  belongs_to :enrollment, class_name: 'Pd::Enrollment', foreign_key: :pd_enrollment_id
end

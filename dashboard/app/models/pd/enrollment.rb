# == Schema Information
#
# Table name: pd_enrollments
#
#  id             :integer          not null, primary key
#  pd_workshop_id :integer          not null
#  name           :string(255)      not null
#  email          :string(255)      not null
#  created_at     :datetime
#  updated_at     :datetime
#
# Indexes
#
#  index_pd_enrollments_on_pd_workshop_id  (pd_workshop_id)
#

class Pd::Enrollment < ActiveRecord::Base
  belongs_to :workshop, class_name: 'Pd::Workshop', foreign_key: :pd_workshop_id
  validates :name, :email, presence: true

  validates_confirmation_of :email

  def user
    User.find_by_email_or_hashed_email self.email
  end
end

# == Schema Information
#
# Table name: coteachers
#
#  id         :integer          not null, primary key
#  user_id    :integer
#  section_id :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_coteachers_on_section_id  (section_id)
#  index_coteachers_on_user_id     (user_id)
#

class Coteacher < ActiveRecord::Base
  belongs_to :user
  belongs_to :section

  def user_must_be_teacher
    if user
      errors.add(:user_id, "must be a teacher") unless user.teacher?
    end
  end

  validates_presence_of :user, :section
  validate :user_must_be_teacher
end

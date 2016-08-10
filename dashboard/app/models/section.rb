# == Schema Information
#
# Table name: sections
#
#  id           :integer          not null, primary key
#  user_id      :integer          not null
#  name         :string(255)
#  created_at   :datetime
#  updated_at   :datetime
#  code         :string(255)
#  script_id    :integer
#  grade        :string(255)
#  admin_code   :string(255)
#  login_type   :string(255)      default("email"), not null
#  deleted_at   :datetime
#  stage_extras :boolean          default(FALSE), not null
#  section_type :string(255)
#
# Indexes
#
#  index_sections_on_code     (code) UNIQUE
#  index_sections_on_user_id  (user_id)
#

require 'cdo/section_helpers'

class Section < ActiveRecord::Base
  belongs_to :user

  has_many :followers, dependent: :restrict_with_error
  accepts_nested_attributes_for :followers

  has_many :students, -> { order('name')}, through: :followers, source: :student_user
  accepts_nested_attributes_for :students

  validates :name, presence: true

  belongs_to :script

  LOGIN_TYPE_PICTURE = 'picture'
  LOGIN_TYPE_WORD = 'word'

  TYPES = [
    TYPE_CSF_WORKSHOP = 'csf_workshop',
    TYPE_PD_WORKSHOP = 'pd_workshop'
  ]
  validates_inclusion_of :section_type, in: TYPES, allow_nil: true

  def user_must_be_teacher
    errors.add(:user_id, "must be a teacher") unless user.user_type == User::TYPE_TEACHER
  end
  validate :user_must_be_teacher

  before_create :assign_code
  def assign_code
    self.code = unused_random_code
  end

  def students_attributes=(params)
    follower_params = params.collect do |student|
      {
       user_id: user.id,
       student_user_attributes: student
      }
    end

    self.followers_attributes = follower_params
  end

  def add_student(student, move_for_same_teacher: true)
    if move_for_same_teacher && (follower = student.followeds.find_by(user_id: self.user_id))
      # if this student is already in another section owned by the
      # same teacher, move them to this section instead of creating a
      # new one
      follower.update_attributes!(section: self)
    else
      follower = Follower.create!(user_id: self.user_id, student_user: student, section: self)
    end
    follower
  end

  def teacher
    user
  end

  private

  def unused_random_code
    loop do
      code = SectionHelpers.random_code
      return code unless Section.exists?(code: code)
    end
  end
end

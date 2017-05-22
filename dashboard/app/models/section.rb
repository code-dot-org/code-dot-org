# == Schema Information
#
# Table name: sections
#
#  id                :integer          not null, primary key
#  user_id           :integer          not null
#  name              :string(255)
#  created_at        :datetime
#  updated_at        :datetime
#  code              :string(255)
#  script_id         :integer
#  grade             :string(255)
#  login_type        :string(255)      default("email"), not null
#  deleted_at        :datetime
#  stage_extras      :boolean          default(FALSE), not null
#  section_type      :string(255)
#  first_activity_at :datetime
#  course_id         :integer
#
# Indexes
#
#  index_sections_on_code     (code) UNIQUE
#  index_sections_on_user_id  (user_id)
#

require 'full-name-splitter'
require 'cdo/code_generation'
require 'cdo/safe_names'

class Section < ActiveRecord::Base
  acts_as_paranoid

  belongs_to :user
  alias_attribute :teacher, :user

  has_many :followers, dependent: :destroy
  accepts_nested_attributes_for :followers

  has_many :students, -> {order('name')}, through: :followers, source: :student_user
  accepts_nested_attributes_for :students

  validates :name, presence: true

  belongs_to :script

  has_many :section_hidden_stages

  LOGIN_TYPE_PICTURE = 'picture'.freeze
  LOGIN_TYPE_WORD = 'word'.freeze

  TYPES = [
    # Insert non-workshop section types here.
  ].concat(Pd::Workshop::SECTION_TYPES).freeze
  validates_inclusion_of :section_type, in: TYPES, allow_nil: true

  def workshop_section?
    Pd::Workshop::SECTION_TYPES.include? section_type
  end

  validates_presence_of :user
  def user_must_be_teacher
    return unless user
    errors.add(:user_id, 'must be a teacher') unless user.teacher?
  end
  validate :user_must_be_teacher

  before_create :assign_code
  def assign_code
    self.code = unused_random_code
  end

  def teacher_dashboard_url
    CDO.code_org_url "/teacher-dashboard#/sections/#{id}/manage", 'https:'
  end

  # return a version of self.students in which all students' names are
  # shortened to their first name (if unique) or their first name plus
  # the minimum number of letters in their last name needed to uniquely
  # identify them
  def name_safe_students
    name_splitter_proc = ->(student) {FullNameSplitter.split(student.name)}

    SafeNames.get_safe_names(students, name_splitter_proc).map do |safe_name_and_student|
      # Replace each student name with the safe name (for this instance, not saved)
      safe_name, student = safe_name_and_student
      student.name = safe_name
      student
    end
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

  # Adds the student to the section, restoring a previous enrollment to do so if possible.
  # @param student [User] The student to enroll in this section.
  # @return [Follower] The newly created follower enrollment.
  def add_student(student)
    follower = Follower.with_deleted.find_by(section: self, student_user: student)
    if follower
      if follower.deleted?
        follower.restore
      end
      return follower
    end

    Follower.create!(section: self, student_user: student)
  end

  # Enrolls student in this section (possibly restoring an existing deleted follower) and removes
  # student from old section.
  # @param student [User] The student to enroll in this section.
  # @param old_section [Section] The section from which to remove the student.
  # @return [Follower | nil] The newly created follower enrollment (possibly nil).
  def add_and_remove_student(student, old_section)
    old_follower = old_section.followers.where(student_user: student).first
    return nil unless old_follower

    old_follower.destroy
    add_student student
  end

  private

  def unused_random_code
    CodeGeneration.random_unique_code length: 6, model: Section
  end
end

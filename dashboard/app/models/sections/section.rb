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
#  course_id         :integer
#  grade             :string(255)
#  login_type        :string(255)      default("email"), not null
#  deleted_at        :datetime
#  stage_extras      :boolean          default(FALSE), not null
#  section_type      :string(255)
#  first_activity_at :datetime
#  pairing_allowed   :boolean          default(TRUE), not null
#
# Indexes
#
#  fk_rails_20b1e5de46        (course_id)
#  index_sections_on_code     (code) UNIQUE
#  index_sections_on_user_id  (user_id)
#

require 'full-name-splitter'
require 'cdo/code_generation'
require 'cdo/safe_names'

class Section < ActiveRecord::Base
  self.inheritance_column = :login_type

  class << self
    def find_sti_class(type_name)
      super(type_name.camelize + 'Section')
    end

    def sti_name
      name.underscore.sub('_section', '')
    end
  end

  include Rails.application.routes.url_helpers
  acts_as_paranoid

  belongs_to :user
  alias_attribute :teacher, :user

  has_many :followers, dependent: :destroy
  accepts_nested_attributes_for :followers

  has_many :students, -> {order('name')}, through: :followers, source: :student_user
  accepts_nested_attributes_for :students

  validates :name, presence: true, unless: -> {deleted?}

  belongs_to :script
  belongs_to :course

  has_many :section_hidden_stages

  SYSTEM_DELETED_NAME = 'system_deleted'.freeze

  LOGIN_TYPE_EMAIL = 'email'.freeze
  LOGIN_TYPE_PICTURE = 'picture'.freeze
  LOGIN_TYPE_WORD = 'word'.freeze
  LOGIN_TYPE_GOOGLE_CLASSROOM = 'google_classroom'.freeze
  LOGIN_TYPE_CLEVER = 'clever'.freeze
  LOGIN_TYPES = [
    LOGIN_TYPE_EMAIL,
    LOGIN_TYPE_PICTURE,
    LOGIN_TYPE_WORD,
    LOGIN_TYPE_GOOGLE_CLASSROOM,
    LOGIN_TYPE_CLEVER,
  ]

  TYPES = [
    # Insert non-workshop section types here.
  ].concat(Pd::Workshop::SECTION_TYPES).freeze
  validates_inclusion_of :section_type, in: TYPES, allow_nil: true

  ADD_STUDENT_EXISTS = 'exists'.freeze
  ADD_STUDENT_SUCCESS = 'success'.freeze

  def self.valid_login_type?(type)
    LOGIN_TYPES.include? type
  end

  # Override default script accessor to use our cache
  def script
    Script.get_from_cache(script_id) if script_id
  end

  def course
    Course.get_from_cache(course_id) if course_id
  end

  def workshop_section?
    Pd::Workshop::SECTION_TYPES.include? section_type
  end

  validates_presence_of :user, unless: -> {deleted?}
  def user_must_be_teacher
    errors.add(:user_id, 'must be a teacher') unless user.try(:teacher?)
  end
  validate :user_must_be_teacher, unless: -> {deleted?}

  before_create :assign_code
  def assign_code
    self.code = unused_random_code unless code
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
  # @return [ADD_STUDENT_EXISTS | ADD_STUDENT_SUCCESS] Whether the student was already
  #   in the section or has now been added.
  def add_student(student)
    follower = Follower.with_deleted.find_by(section: self, student_user: student)
    if follower
      if follower.deleted?
        follower.restore
        return ADD_STUDENT_SUCCESS
      end
      return ADD_STUDENT_EXISTS
    end

    Follower.create!(section: self, student_user: student)
    return ADD_STUDENT_SUCCESS
  end

  # Enrolls student in this section (possibly restoring an existing deleted follower) and removes
  # student from old section.
  # @param student [User] The student to enroll in this section.
  # @param old_section [Section] The section from which to remove the student.
  # @return [boolean] Whether a new student was added.
  def add_and_remove_student(student, old_section)
    old_follower = old_section.followers.where(student_user: student).first
    return false unless old_follower

    old_follower.destroy
    add_student student
  end

  # Remove a student from the section.
  # Follower is determined by the controller so that it can authorize first.
  # Optionally email the teacher.
  def remove_student(student, follower, options)
    follower.delete

    if options[:notify]
      # Though in theory required, we are missing an email address for many teachers.
      if user && user.email.present?
        FollowerMailer.student_disassociated_notify_teacher(teacher, student).deliver_now
      end
    end
  end

  # Clears all personal data from the section object.
  def clean_data
    update(name: SYSTEM_DELETED_NAME)
  end

  # Figures out the default script for this section. If the section is assigned to
  # a course rather than a script, it returns the first script in that course.
  # @return [Script, nil]
  def default_script
    return script if script
    return course.try(:course_scripts).try(:first).try(:script)
  end

  # Provides some information about a section. This is consumed by our SectionsTable
  # React component on the teacher homepage and student homepage
  def summarize
    base_url = CDO.code_org_url('/teacher-dashboard#/sections/')

    title = ''
    link_to_assigned = base_url

    if course
      title = course.localized_title
      link_to_assigned = course_path(course)
    elsif script_id
      title = script.localized_title
      link_to_assigned = script_path(script)
    end

    {
      id: id,
      name: name,
      teacherName: teacher.name,
      linkToProgress: "#{base_url}#{id}/progress",
      assignedTitle: title,
      linkToAssigned: link_to_assigned,
      numberOfStudents: students.length,
      linkToStudents: "#{base_url}#{id}/manage",
      code: code,
      stage_extras: stage_extras,
      pairing_allowed: pairing_allowed,
      login_type: login_type,
      course_id: course_id,
      script: {
        id: script_id,
        name: script.try(:name),
      },
      studentCount: students.size,
      grade: grade,
      providerManaged: provider_managed?
    }
  end

  def self.valid_grades
    @@valid_grades ||= ['K'] + (1..12).collect(&:to_s) + ['Other']
  end

  def self.valid_grade?(grade)
    valid_grades.include? grade
  end

  def provider_managed?
    false
  end

  private

  def unused_random_code
    CodeGeneration.random_unique_code length: 6, model: Section
  end
end

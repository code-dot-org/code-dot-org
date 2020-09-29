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
#  sharing_disabled  :boolean          default(FALSE), not null
#  hidden            :boolean          default(FALSE), not null
#  autoplay_enabled  :boolean          default(FALSE), not null
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
  belongs_to :unit_group, foreign_key: 'course_id'

  has_many :section_hidden_lessons
  has_many :section_hidden_scripts

  # We want to replace uses of "stage" with "lesson" when possible, since "lesson" is the term used by curriculum team.
  # Use an alias here since it's not worth renaming the column in the database. Use "lesson_extras" when possible.
  alias_attribute :lesson_extras, :stage_extras

  # This list is duplicated as SECTION_LOGIN_TYPE in shared_constants.rb and should be kept in sync.
  LOGIN_TYPES = [
    LOGIN_TYPE_EMAIL = 'email'.freeze,
    LOGIN_TYPE_PICTURE = 'picture'.freeze,
    LOGIN_TYPE_WORD = 'word'.freeze,
    LOGIN_TYPE_GOOGLE_CLASSROOM = 'google_classroom'.freeze,
    LOGIN_TYPE_CLEVER = 'clever'.freeze
  ]

  LOGIN_TYPES_OAUTH = [
    LOGIN_TYPE_GOOGLE_CLASSROOM,
    LOGIN_TYPE_CLEVER
  ]

  TYPES = [
    # Insert non-workshop section types here.
  ].concat(Pd::Workshop::SECTION_TYPES).freeze
  validates_inclusion_of :section_type, in: TYPES, allow_nil: true

  ADD_STUDENT_EXISTS = 'exists'.freeze
  ADD_STUDENT_SUCCESS = 'success'.freeze
  ADD_STUDENT_FAILURE = 'failure'.freeze

  def self.valid_login_type?(type)
    LOGIN_TYPES.include? type
  end

  # Override default script accessor to use our cache
  def script
    Script.get_from_cache(script_id) if script_id
  end

  def unit_group
    UnitGroup.get_from_cache(course_id) if course_id
  end

  def workshop_section?
    Pd::Workshop::SECTION_TYPES.include? section_type
  end

  def externally_rostered?
    [LOGIN_TYPE_EMAIL, LOGIN_TYPE_PICTURE, LOGIN_TYPE_WORD].exclude? login_type
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

  def update_student_sharing(sharing_disabled)
    students.each do |student|
      student.update!(sharing_disabled: sharing_disabled)
    end
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
  # @return [ADD_STUDENT_EXISTS | ADD_STUDENT_SUCCESS | ADD_STUDENT_FAILURE] Whether the student was
  #   already in the section or has now been added.
  def add_student(student)
    return ADD_STUDENT_FAILURE if user_id == student.id

    follower = Follower.with_deleted.find_by(section: self, student_user: student)
    if follower
      if follower.deleted?
        follower.restore
        student.update!(sharing_disabled: sharing_disabled) unless student.sharing_disabled
        return ADD_STUDENT_SUCCESS
      end
      return ADD_STUDENT_EXISTS
    end

    Follower.create!(section: self, student_user: student)
    student.update!(sharing_disabled: true) if sharing_disabled?
    return ADD_STUDENT_SUCCESS
  end

  # Remove a student from the section.
  # Follower is determined by the controller so that it can authorize first.
  # Optionally email the teacher.
  def remove_student(student, follower, options)
    follower.delete

    if student.sections_as_student.empty?
      if student.under_13?
        student.update!(sharing_disabled: true)
      else
        student.update!(sharing_disabled: false)
      end
    end

    if options[:notify]
      # Though in theory required, we are missing an email address for many teachers.
      if user && user.email.present?
        FollowerMailer.student_disassociated_notify_teacher(teacher, student).deliver_now
      end
    end
  end

  # Figures out the default script for this section. If the section is assigned to
  # a course rather than a script, it returns the first script in that course.
  # @return [Script, nil]
  def default_script
    return script if script
    return unit_group.try(:default_unit_group_units).try(:first).try(:script)
  end

  def summarize_without_students
    summarize(include_students: false)
  end

  # Provides some information about a section. This is consumed by our SectionsAsStudentTable
  # React component on the teacher homepage and student homepage
  def summarize(include_students: true)
    base_url = CDO.code_org_url('/teacher-dashboard#/sections/')

    title = ''
    link_to_assigned = base_url
    title_of_current_unit = ''
    link_to_current_unit = ''

    if unit_group
      title = unit_group.localized_title
      link_to_assigned = course_path(unit_group)
      if script_id
        title_of_current_unit = script.title_for_display
        link_to_current_unit = script_path(script)
      end
    elsif script_id
      title = script.title_for_display
      link_to_assigned = script_path(script)
    end

    # Remove ordering from scope when not including full
    # list of students, in order to improve query performance.
    unique_students = include_students ?
      students.distinct(&:id) :
      students.unscope(:order).distinct(&:id)
    num_students = unique_students.size

    {
      id: id,
      name: name,
      createdAt: created_at,
      teacherName: teacher.name,
      linkToProgress: "#{base_url}#{id}/progress",
      assignedTitle: title,
      linkToAssigned: link_to_assigned,
      currentUnitTitle: title_of_current_unit,
      linkToCurrentUnit: link_to_current_unit,
      numberOfStudents: num_students,
      linkToStudents: "#{base_url}#{id}/manage",
      code: code,
      lesson_extras: lesson_extras,
      pairing_allowed: pairing_allowed,
      autoplay_enabled: autoplay_enabled,
      sharing_disabled: sharing_disabled?,
      login_type: login_type,
      course_id: course_id,
      script: {
        id: script_id,
        name: script.try(:name),
        project_sharing: script.try(:project_sharing)
      },
      studentCount: num_students,
      grade: grade,
      providerManaged: provider_managed?,
      hidden: hidden,
      students: include_students ? unique_students.map(&:summarize) : nil,
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

  # Hide or unhide a stage for this section
  def toggle_hidden_stage(stage, should_hide)
    hidden_stage = SectionHiddenLesson.find_by(stage_id: stage.id, section_id: id)
    if hidden_stage && !should_hide
      hidden_stage.delete
    elsif hidden_stage.nil? && should_hide
      SectionHiddenLesson.create(stage_id: stage.id, section_id: id)
    end
  end

  # Hide or unhide a script for this section
  def toggle_hidden_script(script, should_hide)
    hidden_script = SectionHiddenScript.find_by(script_id: script.id, section_id: id)
    if hidden_script && !should_hide
      hidden_script.delete
    elsif hidden_script.nil? && should_hide
      SectionHiddenScript.create(script_id: script.id, section_id: id)
    end
  end

  # One of the contstraints for teachers looking for discount codes is that they
  # have a section in which 10+ students have made progress on 5+ levels in both
  # csd2 and csd3
  # Note: This code likely belongs in CircuitPlaygroundDiscountCodeApplication
  # once such a thing exists
  def has_sufficient_discount_code_progress?
    return false if students.length < 10
    csd2 = Script.get_from_cache('csd2-2019')
    csd3 = Script.get_from_cache('csd3-2019')
    raise 'Missing scripts' unless csd2 && csd3

    csd2_programming_level_ids = csd2.levels.select {|level| level.is_a?(Weblab)}.map(&:id)
    csd3_programming_level_ids = csd3.levels.select {|level| level.is_a?(Gamelab)}.map(&:id)

    # Return true if 10+ students meet our progress condition
    num_students_with_sufficient_progress = 0
    students.each do |student|
      csd2_progress_level_ids = student.user_levels_by_level(csd2).keys
      csd3_progress_level_ids = student.user_levels_by_level(csd3).keys

      # Count students who have made progress on 5+ programming levels in both units
      next unless (csd2_progress_level_ids & csd2_programming_level_ids).count >= 5 &&
          (csd3_progress_level_ids & csd3_programming_level_ids).count >= 5

      num_students_with_sufficient_progress += 1
      return true if num_students_with_sufficient_progress >= 10
    end
    false
  end

  # Returns the ids of all scripts which any student in this section has ever
  # been assigned to or made progress on.
  def student_script_ids
    # This performs two queries, but could be optimized to perform only one by
    # doing additional joins.
    Script.joins(:user_scripts).where(user_scripts: {user_id: students.pluck(:id)}).distinct.pluck(:id)
  end

  private

  def unused_random_code
    CodeGeneration.random_unique_code length: 6, model: Section
  end

  # Drops unicode characters not supported by utf8mb3 strings (most commonly emoji)
  # from the section name.
  # We make a best-effort to make the name usable without the removed characters.
  # We can remove this once our database has utf8mb4 support everywhere.
  def strip_emoji_from_name
    # We don't want to fill in a default name if the caller intentionally tried to clear it.
    return unless name.present?

    # Drop emoji and other unsupported characters
    self.name = name&.strip_utf8mb4&.strip

    # If dropping emoji resulted in a blank name, use a default
    self.name = I18n.t('sections.default_name', default: 'Untitled Section') unless name.present?
  end
  before_validation :strip_emoji_from_name
end

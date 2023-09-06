# == Schema Information
#
# Table name: sections
#
#  id                   :integer          not null, primary key
#  user_id              :integer          not null
#  name                 :string(255)
#  created_at           :datetime
#  updated_at           :datetime
#  code                 :string(255)
#  script_id            :integer
#  course_id            :integer
#  grade                :string(255)
#  login_type           :string(255)      default("email"), not null
#  deleted_at           :datetime
#  stage_extras         :boolean          default(FALSE), not null
#  section_type         :string(255)
#  first_activity_at    :datetime
#  pairing_allowed      :boolean          default(TRUE), not null
#  sharing_disabled     :boolean          default(FALSE), not null
#  hidden               :boolean          default(FALSE), not null
#  tts_autoplay_enabled :boolean          default(FALSE), not null
#  restrict_section     :boolean          default(FALSE)
#  properties           :text(65535)
#  participant_type     :string(255)      default("student"), not null
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

class Section < ApplicationRecord
  include SerializedProperties
  include SharedConstants
  include Curriculum::SharedCourseConstants
  self.inheritance_column = :login_type

  class << self
    def find_sti_class(type_name)
      super(type_name.camelize + 'Section')
    end

    def sti_name
      name.underscore.sub('_section', '')
    end
  end

  # Sets a class variable for student limit.
  # Is passed to React and HAML 'add_student' alerts.
  @@section_capacity = 500

  include Rails.application.routes.url_helpers
  acts_as_paranoid

  belongs_to :user, optional: true
  alias_attribute :teacher, :user

  has_many :followers, dependent: :destroy
  accepts_nested_attributes_for :followers

  has_many :students, -> {order('name')}, through: :followers, source: :student_user
  accepts_nested_attributes_for :students

  validates :name, presence: true, unless: -> {deleted?}

  belongs_to :script, class_name: 'Unit', optional: true
  belongs_to :unit_group, foreign_key: 'course_id', optional: true

  has_many :section_hidden_lessons
  has_many :section_hidden_scripts
  has_many :code_review_groups

  # We want to replace uses of "stage" with "lesson" when possible, since "lesson" is the term used by curriculum team.
  # Use an alias here since it's not worth renaming the column in the database. Use "lesson_extras" when possible.
  alias_attribute :lesson_extras, :stage_extras

  validates :participant_type, acceptance: {accept: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.to_h.values, message: 'must be facilitator, teacher, or student'}

  serialize :grade, GradesArray
  # Allow accessing section.grades, without a costly column rename.
  alias_attribute :grades, :grade

  validate :grades_are_subset_of_valid_grades, unless: -> {grades.nil?}
  validate :grades_with_pl_are_only_pl, unless: -> {grades.nil?}

  validate :pl_sections_must_use_email_logins
  validate :pl_sections_must_use_pl_grade
  validate :participant_type_not_changed

  # PL courses which are run with adults should be set up with teacher accounts so they must use
  # email logins
  def pl_sections_must_use_email_logins
    if pl_section? && login_type != LOGIN_TYPE_EMAIL
      errors.add(:login_type, 'must be email for professional learning sections.')
    end
  end

  # PL courses which are run with adults should have the grade type of 'pl'.
  # This value was recommended by RED team.
  def pl_sections_must_use_pl_grade
    if pl_section? && grades != [SharedConstants::PL_GRADE_VALUE]
      errors.add(:grades, 'must be ["pl"] for pl section.')
    end
  end

  # Once a section is set with a certain participant type we do not want to allow changing it
  # as that could cause a bad state where users in the section do not have permissions to view
  # the course the section is assigned to
  def participant_type_not_changed
    if participant_type_changed? && persisted?
      errors.add(:participant_type, "can not be update once set.")
    end
  end

  # We want the `grades` attribute to be a list that only includes elements
  # that exist in the list of valid grades.
  def grades_are_subset_of_valid_grades
    unless Section.valid_grades?(grades)
      errors.add(:grades, "must be one or more of the valid student grades. Expected: #{VALID_GRADES}. Got: #{grades}.")
    end
  end

  # If the grades include 'pl', they must *ONLY* include 'pl'.
  # E.g.: You can't have a section with 'K' and 'pl'.
  def grades_with_pl_are_only_pl
    if grades.include?(SharedConstants::PL_GRADE_VALUE) && grades.length != 1
      errors.add(:grades, "cannot combine pl with other grades")
    end
  end

  def pl_section?
    participant_type != Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student
  end

  serialized_attrs %w(code_review_expires_at)

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

  VALID_GRADES = [
    SharedConstants::STUDENT_GRADE_LEVELS,
    SharedConstants::PL_GRADE_VALUE
  ].flatten.freeze

  ADD_STUDENT_EXISTS = 'exists'.freeze
  ADD_STUDENT_SUCCESS = 'success'.freeze
  ADD_STUDENT_FAILURE = 'failure'.freeze
  ADD_STUDENT_FORBIDDEN = 'forbidden'.freeze
  ADD_STUDENT_FULL = 'full'.freeze
  ADD_STUDENT_RESTRICTED = 'restricted'.freeze

  CSA = 'csa'.freeze
  CSA_PILOT_FACILITATOR = 'csa-pilot-facilitator'.freeze

  def self.valid_login_type?(type)
    LOGIN_TYPES.include? type
  end

  def self.valid_participant_type?(type)
    Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.to_h.value?(type)
  end

  def self.valid_grades?(grades)
    return false if grades.empty?
    (grades - VALID_GRADES).empty?
  end

  # Override default script accessor to use our cache
  def script
    Unit.get_from_cache(script_id) if script_id
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

    students_only = students.where.not(user_type: "teacher")

    SafeNames.get_safe_names(students_only, name_splitter_proc).map do |safe_name_and_student|
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

  # Checks if a user can join a section as a participant by
  # checking if they meet the participant_type for the section
  def can_join_section_as_participant?(user)
    return true if user.permission?(UserPermission::UNIVERSAL_INSTRUCTOR) || user.permission?(UserPermission::LEVELBUILDER)

    if participant_type == Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator
      return user.permission?(UserPermission::FACILITATOR)
    elsif participant_type == Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.teacher
      return user.teacher?
    elsif participant_type == Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student
      return true #if participant_type is student let anyone join
    end

    false
  end

  # Sections can not be assigned courses where participants in the section
  # can not be participants in the course
  def self.can_be_assigned_course?(participant_audience, participant_type)
    Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCES_BY_TYPE[participant_type].include? participant_audience
  end

  # Adds the student to the section, restoring a previous enrollment to do so if possible.
  # @param student [User] The student to enroll in this section.
  # @return [ADD_STUDENT_EXISTS | ADD_STUDENT_SUCCESS | ADD_STUDENT_FAILURE] Whether the student was
  #   already in the section or has now been added.
  def add_student(student, added_by = nil)
    follower = Follower.with_deleted.find_by(section: self, student_user: student)

    return ADD_STUDENT_FAILURE if user_id == student.id
    return ADD_STUDENT_FORBIDDEN unless can_join_section_as_participant?(student)
    # If the section is restricted, return a restricted error unless a user is added by
    # the teacher (Creating a Word or Picture login-based student) or is created via an
    # OAUTH login section (Google Classroom / clever).
    # added_by is passed only from the sections_students_controller, used by teachers to
    # manager their rosters.
    if !(added_by&.id == user_id || (LOGIN_TYPES_OAUTH.include? login_type)) && (restrict_section == true && (!follower || follower.deleted?))
      return ADD_STUDENT_RESTRICTED
    end

    # Unless the sections login type is Google or Clever
    if !externally_rostered? && (students.distinct(&:id).size >= @@section_capacity)
      # Return a full section error if the section is already at capacity.
      return ADD_STUDENT_FULL
    end

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
    follower.destroy

    if student.sections_as_student.empty?
      if student.under_13?
        student.update!(sharing_disabled: true)
      else
        student.update!(sharing_disabled: false)
      end
    end

    # Though in theory required, we are missing an email address for many teachers.
    if options[:notify] && user && user.email.present?
      FollowerMailer.student_disassociated_notify_teacher(teacher, student).deliver_now
    end
  end

  # Figures out the default script for this section. If the section is assigned to
  # a course rather than a script, it returns the first script in that course.
  # @return [Unit, nil]
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
    ActiveRecord::Base.connected_to(role: :reading) do
      base_url = CDO.studio_url('/teacher_dashboard/sections/')

      title = ''
      link_to_assigned = base_url
      title_of_current_unit = ''
      link_to_current_unit = ''
      course_version_name = nil

      if unit_group
        title = unit_group.localized_title
        link_to_assigned = course_path(unit_group)
        course_version_name = unit_group.name
        if script_id
          title_of_current_unit = script.title_for_display
          link_to_current_unit = script_path(script)
        end
      elsif script_id
        title = script.title_for_display
        link_to_assigned = script_path(script)
        course_version_name = script.name
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
        courseVersionName: course_version_name,
        numberOfStudents: num_students,
        linkToStudents: "#{base_url}#{id}/manage_students",
        code: code,
        lesson_extras: lesson_extras,
        pairing_allowed: pairing_allowed,
        tts_autoplay_enabled: tts_autoplay_enabled,
        sharing_disabled: sharing_disabled?,
        login_type: login_type,
        participant_type: participant_type,
        course_offering_id: unit_group ? unit_group&.course_version&.course_offering&.id : script&.course_version&.course_offering&.id,
        course_version_id: unit_group ? unit_group&.course_version&.id : script&.course_version&.id,
        unit_id: unit_group ? script_id : nil,
        course_id: course_id,
        script: {
          id: script_id,
          name: script.try(:name),
          project_sharing: script.try(:project_sharing)
        },
        studentCount: num_students,
        grades: grades,
        providerManaged: provider_managed?,
        hidden: hidden,
        students: include_students ? unique_students.map(&:summarize) : nil,
        restrict_section: restrict_section,
        is_assigned_csa: assigned_csa?,
        # this will be true when we are in emergency mode, for the scripts returned by ScriptConfig.hoc_scripts and ScriptConfig.csf_scripts
        post_milestone_disabled: !!script && !Gatekeeper.allows('postMilestone', where: {script_name: script.name}, default: true),
        code_review_expires_at: code_review_expires_at
      }
    end
  end

  def provider_managed?
    false
  end

  def at_capacity?
    students.distinct(&:id).size >= @@section_capacity
  end

  def capacity
    @@section_capacity
  end

  def restricted?
    restrict_section
  end

  def will_be_over_capacity?(students_to_add)
    students.distinct(&:id).size + students_to_add > @@section_capacity
  end

  # Hide or unhide a lesson for this section
  def toggle_hidden_lesson(lesson, should_hide)
    hidden_lesson = SectionHiddenLesson.find_by(stage_id: lesson.id, section_id: id)
    if hidden_lesson && !should_hide
      hidden_lesson.delete
    elsif hidden_lesson.nil? && should_hide
      SectionHiddenLesson.create(stage_id: lesson.id, section_id: id)
    end
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

  # One of the constraints for teachers looking for discount codes is that they
  # have a section in which 10+ students have made progress on 5+ levels in both
  # csd2 and csd3
  # Note: This code likely belongs in CircuitPlaygroundDiscountCodeApplication
  # once such a thing exists
  def has_sufficient_discount_code_progress?
    return false if students.length < 10
    csd2 = Unit.get_from_cache('csd2-2019')
    csd3 = Unit.get_from_cache('csd3-2019')
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

  # Returns the ids of all units which any participant in this section has ever
  # been assigned to or made progress on if the instructor of the section can
  # be an instructor for that unit
  def participant_unit_ids
    # This performs two queries, but could be optimized to perform only one by
    # doing additional joins.
    Unit.joins(:user_scripts).where(user_scripts: {user_id: students.pluck(:id)}).distinct.select {|s| s.course_assignable?(user)}.pluck(:id)
  end

  def code_review_enabled?
    return false if code_review_expires_at.nil?
    return code_review_expires_at > Time.now.utc
  end

  # A section can be assigned a course (aka unit_group) without being assigned a script,
  # so we check both here.
  def assigned_csa?
    script&.csa? || [CSA, CSA_PILOT_FACILITATOR].include?(unit_group&.family_name)
  end

  def reset_code_review_groups(new_groups)
    ActiveRecord::Base.transaction do
      code_review_groups.destroy_all
      new_groups.each do |group|
        # skip any unassigned members
        next if group[:unassigned]
        new_group = CodeReviewGroup.create!(name: group[:name], section_id: id)
        next unless group[:members]
        group[:members].each do |member|
          CodeReviewGroupMember.create!(follower_id: member[:follower_id], code_review_group_id: new_group.id)
        end
      end
    end
  end

  def update_code_review_expiration(enable_code_review)
    self.code_review_expires_at = enable_code_review ? Time.now.utc + 90.days : nil
  end

  private def unused_random_code
    CodeGeneration.random_unique_code length: 6, model: Section
  end

  # Drops unicode characters not supported by utf8mb3 strings (most commonly emoji)
  # from the section name.
  # We make a best-effort to make the name usable without the removed characters.
  # We can remove this once our database has utf8mb4 support everywhere.
  private def strip_emoji_from_name
    # We don't want to fill in a default name if the caller intentionally tried to clear it.
    return if name.blank?

    # Drop emoji and other unsupported characters
    self.name = name&.strip_utf8mb4&.strip

    # If dropping emoji resulted in a blank name, use a default
    self.name = I18n.t('sections.default_name', default: 'Untitled Section') if name.blank?
  end
  before_validation :strip_emoji_from_name
end

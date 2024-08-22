# == Schema Information
#
# Table name: pd_enrollments
#
#  id                  :integer          not null, primary key
#  pd_workshop_id      :integer          not null
#  name                :string(255)
#  first_name          :string(255)
#  last_name           :string(255)
#  email               :string(255)      not null
#  created_at          :datetime
#  updated_at          :datetime
#  school              :string(255)
#  code                :string(255)
#  user_id             :integer
#  survey_sent_at      :datetime
#  completed_survey_id :integer
#  school_info_id      :integer
#  deleted_at          :datetime
#  properties          :text(65535)
#  application_id      :integer
#
# Indexes
#
#  index_pd_enrollments_on_code            (code) UNIQUE
#  index_pd_enrollments_on_email           (email)
#  index_pd_enrollments_on_pd_workshop_id  (pd_workshop_id)
#  index_pd_enrollments_on_user_id         (user_id)
#

require 'cdo/code_generation'
require 'cdo/safe_names'

class Pd::Enrollment < ApplicationRecord
  include SchoolInfoDeduplicator
  include Rails.application.routes.url_helpers
  include Pd::WorkshopConstants
  include Pd::WorkshopSurveyConstants
  include SerializedProperties
  include Pd::Application::ActiveApplicationModels
  include Pd::Application::ApplicationConstants
  include Pd::WorkshopSurveyFoormConstants

  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :workshop, class_name: 'Pd::Workshop', foreign_key: :pd_workshop_id, optional: true
  belongs_to :school_info, optional: true
  belongs_to :user, optional: true
  has_one :pre_workshop_survey, class_name: 'Pd::PreWorkshopSurvey', foreign_key: :pd_enrollment_id
  has_many :attendances, class_name: 'Pd::Attendance', foreign_key: :pd_enrollment_id
  auto_strip_attributes :first_name, :last_name

  accepts_nested_attributes_for :school_info, reject_if: :check_school_info
  validates_associated :school_info

  validates_presence_of :first_name, unless: :deleted?

  validates_presence_of :email, unless: :deleted?
  validates_confirmation_of :email, unless: :deleted?
  validates_email_format_of :email, allow_blank: true
  validates :email, uniqueness: {scope: :pd_workshop_id, message: 'already enrolled in workshop', case_sensitive: false}, unless: :deleted?

  validate :school_forbidden, if: -> {new_record? || school_changed?}

  before_validation :autoupdate_user_field
  before_save :set_application_id
  after_create :set_default_scholarship_info
  after_save :authorize_teacher_account

  serialized_attrs %w(
    role
    grades_teaching
    attended_csf_intro_workshop
    csf_course_experience
    csf_courses_planned
    previous_courses
    replace_existing
    csf_intro_intent
    csf_intro_other_factors
    years_teaching
    years_teaching_cs
    taught_ap_before
    planning_to_teach_ap
  )

  def set_default_scholarship_info
    if user && workshop.csf? && workshop.school_year
      Pd::ScholarshipInfo.update_or_create(user, workshop.school_year, COURSE_KEY_MAP[workshop.course], Pd::ScholarshipInfoConstants::YES_CDO)
    end
  end

  def self.for_user(user)
    where('email = ? OR user_id = ?', user.email_for_enrollments, user.id)
  end

  # Name split (https://github.com/code-dot-org/code-dot-org/pull/11679) was deployed on 2016-11-09
  def created_before_name_split?
    persisted? && created_at < '2016-11-10'
  end

  # School info (https://github.com/code-dot-org/code-dot-org/pull/9023) was deployed on 2016-08-30
  def created_before_school_info?
    persisted? && created_at < '2016-08-30'
  end

  def school_forbidden
    errors.add(:school, 'is forbidden') if read_attribute(:school)
  end

  def school_info_country_required
    errors.add(:school_info, 'must have a country') unless school_info.try(:country)
  end

  def self.for_school_district(school_district)
    joins(:school_info).where(school_infos: {school_district_id: school_district.id})
  end

  scope :attended, -> {joins(:attendances).group('pd_enrollments.id')}
  scope :not_attended, -> {includes(:attendances).where(pd_attendances: {pd_enrollment_id: nil})}
  scope :for_ended_workshops, -> {joins(:workshop).where.not(pd_workshops: {ended_at: nil})}

  # Any enrollment with attendance, for an ended workshop, has a survey.
  # Except for FiT workshops - no exit surveys for them!
  # This scope is used in ProfessionalLearningLandingController to direct the teacher
  #   to their latest pending survey.
  scope :with_surveys, (lambda do
    for_ended_workshops.
      attended.
      where.not(pd_workshops: {course: COURSE_FACILITATOR}).
      where('pd_workshops.subject != ? or pd_workshops.subject is null', [SUBJECT_FIT])
  end)

  def has_user?
    user_id
  end

  # Filters a list of workshops user is enrolled in with (in)complete surveys (dependent on select_completed).
  # @param enrollments [Enumerable<Pd::Enrollment>] list of enrollments to filter.
  # @param select_completed [Boolean] if true, return only enrollments with completed surveys,
  #   otherwise return only those without completed surveys. Defaults to true.
  # @return [Enumerable<Pd::Enrollment>]
  def self.filter_for_survey_completion(enrollments, select_completed = true)
    raise 'Expected enrollments to be an Enumerable list of Pd::Enrollment objects' unless
        enrollments.is_a?(Enumerable) && enrollments.all?(Pd::Enrollment)

    # Filter out Local summer, CSP Workshop for Returning Teachers, and CSF Intro workshops before 5/8/2020 (they
    # do not use Foorm for survey completion); CSF Deep Dive workshops before 9/1/2020 (they do not use Foorm for
    # survey completion); and Admin + Admin/Counselor workshops (they should not receive exit surveys at all).
    foorm_enrollments = enrollments.select do |enrollment|
      !admin_workshop?(enrollment.workshop) && currently_receives_foorm_survey(enrollment.workshop)
    end

    # We do not want to check survey completion for the following workshop types: Legacy (non-Foorm) summer,
    # CSF Intro, and CSF Deep Dive (surveys would be too out of date), teachercon (deprecated),
    # Admin (deprecated), Counselor (deprecated), or any academic year workshop
    # (there are multiple post-survey options, therefore the facilitators must provide a link themselves).
    filter_for_foorm_survey_completion(foorm_enrollments, select_completed)
  end

  before_create :assign_code
  def assign_code
    self.code = unused_random_code
  end

  # Always store emails in lowercase and stripped to match the behavior in User.
  def email=(value)
    write_attribute(:email, value.try(:downcase).try(:strip))
  end

  def resolve_user
    user || User.find_by_email_or_hashed_email(email) || User.find_by(id: application&.user_id)
  end

  # Pre-workshop survey URL (if any)
  def pre_workshop_survey_url
    if workshop.local_summer? || workshop.ayw?
      url_for(action: 'new_pre_foorm', controller: 'pd/workshop_daily_survey', enrollmentCode: code)
    elsif workshop.subject == Pd::Workshop::SUBJECT_CSF_201
      CDO.studio_url "pd/workshop_survey/csf/pre201", CDO.default_scheme
    end
  end

  def exit_survey_url
    if workshop.course == Pd::Workshop::COURSE_CSF && (workshop.subject == Pd::Workshop::SUBJECT_CSF_101 || workshop.subject == Pd::Workshop::SUBJECT_CSF_DISTRICT)
      CDO.studio_url "pd/workshop_survey/csf/post101/#{code}", CDO.default_scheme
    elsif workshop.csf? && workshop.subject == Pd::Workshop::SUBJECT_CSF_201
      CDO.studio_url "/pd/workshop_survey/csf/post201/#{code}", CDO.default_scheme
    else
      CDO.studio_url "/pd/workshop_survey/post/#{code}", CDO.default_scheme
    end
  end

  def should_send_exit_survey?
    !(workshop.fit_weekend? || workshop.course == Pd::Workshop::COURSE_ADMIN_COUNSELOR)
  end

  def send_exit_survey
    # In case the workshop is reprocessed, do not send duplicate exit surveys.
    if survey_sent_at
      CDO.log.warn "Skipping attempt to send a duplicate workshop survey email. Enrollment: #{id}"
      return
    end

    return unless should_send_exit_survey?

    # Don't send if there's no associated survey
    return unless exit_survey_url

    return unless (mailer = Pd::WorkshopMailer.exit_survey(self))

    mailer.deliver_now
    update!(survey_sent_at: Time.zone.now)
  end

  # TODO: Once we're satisfied with the first/last name split data,
  # remove the name field entirely.
  def name=(value)
    ActiveSupport::Deprecation.warn('name is deprecated. Use first_name & last_name instead.')
    self.full_name = value
  end

  def name
    ActiveSupport::Deprecation.warn('name is deprecated. Use first_name & last_name instead.')
    full_name
  end

  # Convenience method for combining first and last name into a full name
  # @return [String] Combined first_name last_name
  def full_name
    "#{first_name} #{last_name}".strip
  end

  # Convenience method for setting first and last names from a full name
  # @param value [String]
  #   Combined full name, which will be split on the first space to set
  #   the first_name and last_name properties
  def full_name=(value)
    first_name, last_name = value.split(' ', 2)
    write_attribute :first_name, first_name
    write_attribute :last_name, last_name || ''
  end

  # Maps enrollments to safe names
  # @return [Array<Array<String, Pd::Enrollment>>] Array of tuples
  #   representing the safe name and associated enrollment
  def self.get_safe_names
    # Use full name
    all.map {|enrollment| [enrollment.full_name, enrollment]}
  end

  # TODO: Migrate existing school entries into schoolInfo and delete school column
  def school
    ActiveSupport::Deprecation.warn('School is deprecated. Use school_info or school_name instead.')
    read_attribute :school
  end

  def school_name
    school_info.try(:effective_school_name) || read_attribute(:school)
  end

  def school_district_name
    school_info.try :effective_school_district_name
  end

  def update_scholarship_status(status)
    if workshop.scholarship_workshop?
      Pd::ScholarshipInfo.update_or_create(user, workshop.school_year, workshop.course_key, status)
    end
  end

  def scholarship_status
    if workshop.scholarship_workshop?
      Pd::ScholarshipInfo.find_by(user: user, application_year: workshop.school_year, course: workshop.course_key)&.scholarship_status
    end
  end

  def friendly_scholarship_status
    if workshop.scholarship_workshop?
      Pd::ScholarshipInfo.
        find_by(user: user, application_year: workshop.school_year, course: workshop.course_key)&.
        friendly_status_name
    end
  end

  # Finds the application a user used for a workshop.
  # Returns the id if (a) the course listed on their application
  # matches the workshop course and user, or (b) a workshop id was
  # added to the user's application that matches this enrollment's
  # workshop id
  # @return [Integer, nil] application id or nil if cannot find any application
  def set_application_id
    course_match = ->(application) {COURSE_NAME_MAP[application.try(:course)&.to_sym] == workshop.try(:course)}
    pd_match = ->(application) {application.try(:pd_workshop_id) == pd_workshop_id}

    application_id = nil
    # Finds application from the school year of the workshop. Assumes workshops start after 6/1
    # because workshop.school_year assumes 6/1 is the start of the school year
    Pd::Application::TeacherApplication.where(user_id: user_id, application_year: workshop&.school_year).each do |application|
      application_id = application.id if course_match.call(application) || pd_match.call(application)
      break if application_id
    end
    self.application_id = application_id
  end

  def application
    return nil unless application_id
    Pd::Application::TeacherApplication.find_by(id: application_id)
  end

  # Removes the name and email information stored within this Pd::Enrollment.
  def clear_data
    write_attribute :name, nil
    self.first_name = nil
    self.last_name = nil
    self.email = ''
    self.user_id = nil
    self.school = nil
    self.school_info_id = nil
    self.application_id = nil
    self.deleted_at = Time.now
    save!
  end

  protected def autoupdate_user_field
    resolved_user = resolve_user
    self.user = resolve_user if resolved_user
  end

  protected def check_school_info(school_info_attr)
    deduplicate_school_info(school_info_attr, self)
  end

  protected def authorize_teacher_account
    user.permission = UserPermission::AUTHORIZED_TEACHER if user&.teacher? && [COURSE_CSD, COURSE_CSP, COURSE_CSA, COURSE_BUILD_YOUR_OWN].include?(workshop.course)
  end

  # Returns true if the given workshop is an Admin or Admin/Counselor workshop
  private_class_method def self.admin_workshop?(workshop)
    workshop.course == Pd::Workshop::COURSE_ADMIN ||
      workshop.course == Pd::Workshop::COURSE_ADMIN_COUNSELOR
  end

  # Returns if the given workshop uses Foorm for survey completion (assuming the workshop does receive exit
  # surveys). Some types of workshops previously did not use Foorm before certain dates, so this returns
  # false for:
  # - CSF Deep Dive workshops before 9/1/2020
  # - Local summer, CSP Workshop for Returning Teachers, and CSF Intro workshops before 5/8/2020
  # And returns true otherwise.
  private_class_method def self.currently_receives_foorm_survey(workshop)
    !(workshop.workshop_ending_date < Date.new(2020, 9, 1) && workshop.csf_201?) &&
      !(workshop.workshop_ending_date < Date.new(2020, 5, 8) &&
      (workshop.csf_intro? || workshop.local_summer? || workshop.csp_wfrt?))
  end

  private_class_method def self.filter_for_foorm_survey_completion(enrollments, select_completed)
    completed_surveys, uncompleted_surveys = enrollments.partition do |enrollment|
      workshop = enrollment.workshop
      form_name = POST_SURVEY_CONFIG_PATHS[workshop.subject]
      Pd::WorkshopSurveyFoormSubmission.where(pd_workshop: workshop, user: enrollment.user).
        joins(:foorm_submission).
        exists?(foorm_submissions: {form_name: form_name})
    end

    select_completed ? completed_surveys : uncompleted_surveys
  end

  private def unused_random_code
    CodeGeneration.random_unique_code length: 10, model: Pd::Enrollment
  end
end

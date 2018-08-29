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
#
# Indexes
#
#  index_pd_enrollments_on_code            (code) UNIQUE
#  index_pd_enrollments_on_email           (email)
#  index_pd_enrollments_on_pd_workshop_id  (pd_workshop_id)
#

require 'cdo/code_generation'
require 'cdo/safe_names'

class Pd::Enrollment < ActiveRecord::Base
  include SchoolInfoDeduplicator
  include Rails.application.routes.url_helpers
  include Pd::SharedWorkshopConstants
  include Pd::WorkshopSurveyConstants
  include SerializedProperties

  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :workshop, class_name: 'Pd::Workshop', foreign_key: :pd_workshop_id
  belongs_to :school_info
  belongs_to :user
  has_one :workshop_material_order, class_name: 'Pd::WorkshopMaterialOrder', foreign_key: :pd_enrollment_id
  has_one :pre_workshop_survey, class_name: 'Pd::PreWorkshopSurvey', foreign_key: :pd_enrollment_id
  has_many :attendances, class_name: 'Pd::Attendance', foreign_key: :pd_enrollment_id
  auto_strip_attributes :first_name, :last_name

  accepts_nested_attributes_for :school_info, reject_if: :check_school_info
  validates_associated :school_info

  validates_presence_of :first_name, unless: :deleted?

  # Some old enrollments, from before the first/last name split, don't have last names.
  # Require on all new enrollments.
  validates_presence_of :last_name, unless: -> {deleted? || created_before_name_split?}

  validates_presence_of :email, unless: :deleted?
  validates_confirmation_of :email, unless: :deleted?
  validates_email_format_of :email, allow_blank: true

  validate :school_forbidden, if: -> {new_record? || school_changed?}
  validates_presence_of :school_info, unless: -> {deleted? || created_before_school_info?}
  validate :school_info_country_required, if: -> {!deleted? && (new_record? || school_info_id_changed?)}

  before_validation :autoupdate_user_field
  after_save :enroll_in_corresponding_online_learning, if: -> {!deleted? && (user_id_changed? || email_changed?)}
  after_save :authorize_teacher_account

  serialized_attrs %w(
    role
    grades_teaching
  )

  def self.for_user(user)
    where('email = ? OR user_id = ?', user.email, user.id)
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

  # Any enrollment with attendance, for an ended workshop, has a survey
  scope :with_surveys, -> {for_ended_workshops.attended}

  def has_user?
    user_id
  end

  def completed_survey?
    return true if completed_survey_id.present?

    # Until the survey is processed (via process_forms cron job), it won't show up in the enrollment model.
    # Check pegasus forms directly to be sure.
    PEGASUS_DB[:forms].where(kind: 'PdWorkshopSurvey', source_id: id).any?
  end

  def survey_class
    if workshop.local_summer?
      Pd::LocalSummerWorkshopSurvey
    else
      Pd::WorkshopSurvey
    end
  end

  # Filters a list of enrollments for survey completion, checking with Pegasus (in batch) to include
  # new unprocessed surveys that don't yet show up in this model, or checking in with
  # the Pd::TeacherconSurvey model
  # @param enrollments [Enumerable<Pd::Enrollment>] list of enrollments to filter.
  # @param select_completed [Boolean] if true, return only enrollments with completed surveys,
  #   otherwise return only those without completed surveys. Defaults to true.
  # @return [Enumerable<Pd::Enrollment>]
  def self.filter_for_survey_completion(enrollments, select_completed = true)
    raise 'Expected enrollments to be an Enumerable list of Pd::Enrollment objects' unless
        enrollments.is_a?(Enumerable) && enrollments.all? {|e| e.is_a?(Pd::Enrollment)}

    teachercon_enrollments, non_teachercon_enrollments = enrollments.partition do |enrollment|
      enrollment.workshop.teachercon?
    end

    local_summer_enrollments, other_enrollments = non_teachercon_enrollments.partition do |enrollment|
      enrollment.workshop.local_summer?
    end
    new_academic_year_enrollments, other_enrollments = other_enrollments.partition do |enrollment|
      [Pd::Workshop::COURSE_CSP, Pd::Workshop::COURSE_CSD].include?(enrollment.workshop.course) && enrollment.workshop.workshop_starting_date > Date.new(2018, 8, 1)
    end

    (
      filter_for_regular_survey_completion(other_enrollments, select_completed) +
      filter_for_teachercon_survey_completion(teachercon_enrollments, select_completed) +
      filter_for_local_summer_survey_completion(local_summer_enrollments, select_completed) +
      filter_for_academic_year_survey_completion(new_academic_year_enrollments, select_completed)
    )
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
    user || User.find_by_email_or_hashed_email(email)
  end

  def exit_survey_url
    if [Pd::Workshop::COURSE_ADMIN, Pd::Workshop::COURSE_COUNSELOR].include? workshop.course
      CDO.code_org_url "/pd-workshop-survey/counselor-admin/#{code}", CDO.default_scheme
    elsif workshop.summer?
      pd_new_workshop_survey_url(code, protocol: CDO.default_scheme)
    elsif [Pd::Workshop::COURSE_CSP, Pd::Workshop::COURSE_CSD].include?(workshop.course) && workshop.workshop_starting_date > Date.new(2018, 8, 1)
      CDO.studio_url "/pd/workshop_survey/day/#{workshop.sessions.size}?enrollmentCode=#{code}", CDO.default_scheme
    else
      CDO.code_org_url "/pd-workshop-survey/#{code}", CDO.default_scheme
    end
  end

  def should_send_exit_survey?
    !workshop.fit_weekend? && workshop.subject != SUBJECT_CSF_201
  end

  def send_exit_survey
    # In case the workshop is reprocessed, do not send duplicate exit surveys.
    if survey_sent_at
      CDO.log.warn "Skipping attempt to send a duplicate workshop survey email. Enrollment: #{id}"
      return
    end

    return unless should_send_exit_survey?

    Pd::WorkshopMailer.exit_survey(self).deliver_now

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

  # Removes the name and email information stored within this Pd::Enrollment.
  def clear_data
    write_attribute :name, nil
    self.first_name = nil
    self.last_name = nil
    self.email = ''
    self.user_id = nil
    self.school = nil
    self.school_info_id = nil
    self.deleted_at = Time.now
    save!
  end

  protected

  def autoupdate_user_field
    resolved_user = resolve_user
    self.user = resolve_user if resolved_user
  end

  def enroll_in_corresponding_online_learning
    if user && workshop.associated_online_course
      Plc::UserCourseEnrollment.find_or_create_by(user: user, plc_course: workshop.associated_online_course)
    end
  end

  def check_school_info(school_info_attr)
    deduplicate_school_info(school_info_attr, self)
  end

  def authorize_teacher_account
    user.permission = UserPermission::AUTHORIZED_TEACHER if user && [COURSE_CSD, COURSE_CSP].include?(workshop.course)
  end

  private_class_method def self.filter_for_regular_survey_completion(enrollments, select_completed)
    ids_with_processed_surveys, ids_without_processed_surveys =
      enrollments.partition {|e| e.completed_survey_id.present?}.map {|list| list.map(&:id)}

    ids_with_unprocessed_surveys = PEGASUS_DB[:forms].where(
      kind: 'PdWorkshopSurvey',
      source_id: ids_without_processed_surveys
    ).map do |survey|
      survey[:source_id].to_i
    end

    filtered_ids = select_completed ?
                       ids_with_processed_surveys + ids_with_unprocessed_surveys :
                       ids_without_processed_surveys - ids_with_unprocessed_surveys

    enrollments.select {|e| filtered_ids.include? e.id}
  end

  private_class_method def self.filter_for_teachercon_survey_completion(teachercon_enrollments, selected_completed)
    completed_surveys, uncompleted_surveys = teachercon_enrollments.partition do |enrollment|
      Pd::TeacherconSurvey.exists?(pd_enrollment_id: enrollment.id)
    end

    selected_completed ? completed_surveys : uncompleted_surveys
  end

  private_class_method def self.filter_for_local_summer_survey_completion(local_summer_enrollments, select_completed)
    completed_surveys, uncompleted_surveys = local_summer_enrollments.partition do |enrollment|
      workshop = enrollment.workshop
      user = enrollment.user
      Pd::WorkshopDailySurvey.exists?(pd_workshop: workshop, user: user, day: 5)
    end

    select_completed ? completed_surveys : uncompleted_surveys
  end

  private_class_method def self.filter_for_academic_year_survey_completion(academic_year_enrollments, select_completed)
    completed_surveys, uncompleted_surveys = academic_year_enrollments.partition do |enrollment|
      workshop = enrollment.workshop
      Pd::WorkshopDailySurvey.exists?(pd_workshop: workshop, user: enrollment.user, form_id: Pd::WorkshopDailySurvey.get_form_id_for_subject_and_day(workshop.subject, POST_WORKSHOP_FORM_KEY))
    end

    select_completed ? completed_surveys : uncompleted_surveys
  end

  private

  def unused_random_code
    CodeGeneration.random_unique_code length: 10, model: Pd::Enrollment
  end
end

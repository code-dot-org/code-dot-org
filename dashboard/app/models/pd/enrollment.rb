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
  acts_as_paranoid # Use deleted_at column instead of deleting rows.

  belongs_to :workshop, class_name: 'Pd::Workshop', foreign_key: :pd_workshop_id
  belongs_to :school_info
  belongs_to :user
  has_one :workshop_material_order, class_name: 'Pd::WorkshopMaterialOrder', foreign_key: :pd_enrollment_id
  has_many :attendances, class_name: 'Pd::Attendance', foreign_key: :pd_enrollment_id
  auto_strip_attributes :first_name, :last_name

  accepts_nested_attributes_for :school_info, reject_if: :check_school_info
  validates_associated :school_info

  validates_presence_of :first_name

  # Some old enrollments, from before the first/last name split, don't have last names.
  # Require on all new enrollments.
  validates_presence_of :last_name, unless: :created_before_name_split?

  validates_presence_of :email
  validates_confirmation_of :email
  validates_email_format_of :email, allow_blank: true

  validate :validate_school_name, unless: :created_before_school_info?
  validates_presence_of :school_info, unless: :created_before_school_info?

  before_validation :autoupdate_user_field
  after_create :enroll_in_corresponding_online_learning

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

  # enrollment.school is required in the old format (no country) and forbidden in the new format (with country).
  # To avoid breaking any existing codepaths, use the old format when school_info is absent.
  def validate_school_name
    if school_info.try(:country)
      errors.add(:school, 'is forbidden') if school
    else
      errors.add(:school, 'is required') unless school
    end
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
  # new unprocessed surveys that don't yet show up in this model.
  # @param enrollments [Enumerable<Pd::Enrollment>] list of enrollments to filter.
  # @param select_completed [Boolean] if true, return only enrollments with completed surveys,
  #   otherwise return only those without completed surveys. Defaults to true.
  # @return [Enumerable<Pd::Enrollment>]
  def self.filter_for_survey_completion(enrollments, select_completed = true)
    raise 'Expected enrollments to be an Enumerable list of Pd::Enrollment objects' unless
      enrollments.is_a?(Enumerable) && enrollments.all? {|e| e.is_a?(Pd::Enrollment)}

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

  def in_section?
    user = resolve_user
    return false unless user && workshop.section

    # Teachers enrolled in the workshop are "students" in the section.
    workshop.section.students.exists?(user.id)
  end

  def exit_survey_url
    if [Pd::Workshop::COURSE_ADMIN, Pd::Workshop::COURSE_COUNSELOR].include? workshop.course
      CDO.code_org_url "/pd-workshop-survey/counselor-admin/#{code}", 'https:'
    else
      pd_new_workshop_survey_url(code)
    end
  end

  def send_exit_survey
    # In case the workshop is reprocessed, do not send duplicate exit surveys.
    if survey_sent_at
      CDO.log.warn "Skipping attempt to send a duplicate workshop survey email. Enrollment: #{id}"
      return
    end

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

  def self.get_safe_names
    first_last_name_proc = ->(enrollment) {[enrollment.first_name, enrollment.last_name]}
    SafeNames.get_safe_names(all, first_last_name_proc)
  end

  protected

  def autoupdate_user_field
    self.user = user || resolve_user
  end

  def enroll_in_corresponding_online_learning
    if user && workshop.associated_online_course
      Plc::UserCourseEnrollment.find_or_create_by(user: user, plc_course: workshop.associated_online_course)
    end
  end

  def check_school_info(school_info_attr)
    deduplicate_school_info(school_info_attr, self)
  end

  private

  def unused_random_code
    CodeGeneration.random_unique_code length: 10, model: Pd::Enrollment
  end
end

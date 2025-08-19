# == Schema Information
#
# Table name: users
#
#  id                       :integer          not null, primary key
#  studio_person_id         :integer
#  email                    :string(255)      default(""), not null
#  parent_email             :string(255)
#  encrypted_password       :string(255)      default("")
#  reset_password_token     :string(255)
#  reset_password_sent_at   :datetime
#  remember_created_at      :datetime
#  sign_in_count            :integer          default(0)
#  current_sign_in_at       :datetime
#  last_sign_in_at          :datetime
#  current_sign_in_ip       :string(255)
#  last_sign_in_ip          :string(255)
#  created_at               :datetime
#  updated_at               :datetime
#  username                 :string(255)
#  provider                 :string(255)
#  uid                      :string(255)
#  admin                    :boolean
#  gender                   :string(1)
#  name                     :string(255)
#  locale                   :string(10)       default("en-US"), not null
#  birthday                 :date
#  user_type                :string(16)
#  school                   :string(255)
#  full_address             :string(1024)
#  school_info_id           :integer
#  total_lines              :integer          default(0), not null
#  secret_picture_id        :integer
#  active                   :boolean          default(TRUE), not null
#  hashed_email             :string(255)
#  deleted_at               :datetime
#  purged_at                :datetime
#  secret_words             :string(255)
#  properties               :text(65535)
#  invitation_token         :string(255)
#  invitation_created_at    :datetime
#  invitation_sent_at       :datetime
#  invitation_accepted_at   :datetime
#  invitation_limit         :integer
#  invited_by_id            :integer
#  invited_by_type          :string(255)
#  invitations_count        :integer          default(0)
#  terms_of_service_version :integer
#  urm                      :boolean
#  races                    :string(255)
#  primary_contact_info_id  :integer
#  unlock_token             :string(255)
#  cap_status               :string(1)
#  cap_status_date          :datetime
#
# Indexes
#
#  index_users_on_birthday                             (birthday)
#  index_users_on_cap_status_and_cap_status_date       (cap_status,cap_status_date)
#  index_users_on_current_sign_in_at                   (current_sign_in_at)
#  index_users_on_deleted_at                           (deleted_at)
#  index_users_on_email_and_deleted_at                 (email,deleted_at)
#  index_users_on_hashed_email_and_deleted_at          (hashed_email,deleted_at)
#  index_users_on_invitation_token                     (invitation_token) UNIQUE
#  index_users_on_invitations_count                    (invitations_count)
#  index_users_on_invited_by_id                        (invited_by_id)
#  index_users_on_parent_email                         (parent_email)
#  index_users_on_provider_and_uid_and_deleted_at      (provider,uid,deleted_at) UNIQUE
#  index_users_on_purged_at                            (purged_at)
#  index_users_on_reset_password_token_and_deleted_at  (reset_password_token,deleted_at) UNIQUE
#  index_users_on_school_info_id                       (school_info_id)
#  index_users_on_studio_person_id                     (studio_person_id)
#  index_users_on_unlock_token                         (unlock_token) UNIQUE
#  index_users_on_username_and_deleted_at              (username,deleted_at) UNIQUE
#

require 'digest/md5'
require 'state_abbr'
require 'cdo/aws/metrics'
require 'cdo/shared_constants'
require_relative '../../legacy/middleware/helpers/user_helpers'
require 'school_info_interstitial_helper'
require_dependency 'queries/school_info'
require_dependency 'queries/script_activity'
require 'policies/child_account'
require 'services/child_account'
require 'policies/lti'
require 'services/user'

class User < ApplicationRecord
  include SerializedProperties
  include SchoolInfoDeduplicator
  include EmailPreferences
  include LevelProgressable
  include LocaleHelper
  include Nameable
  include Username
  include UserMultiAuthHelper
  include UserPermissionGrantee
  include PasswordValidations
  include EmailValidations
  include ProviderFlags
  include Verifiable
  include Age
  include AiAccessible
  include SectionParticipation
  include AssignedCoursesAndScripts
  include PartialRegistration
  include Purgeable
  include Facilitator
  include TermsOfService
  include Rails.application.routes.url_helpers

  self.inheritance_column = :user_type

  # :user_type is locked. Use the :permissions property for more granular user permissions.
  USER_TYPE_OPTIONS = [
    TYPE_STUDENT = SharedConstants::USER_TYPES.STUDENT,
    TYPE_TEACHER = SharedConstants::USER_TYPES.TEACHER,
  ].freeze

  TYPE_TO_STI_CLASS_MAP = {
    TYPE_TEACHER => ::Teacher,
    TYPE_STUDENT => ::Student,
    'staff' => ::Teacher # Powerschool sends through 'staff' instead of 'teacher'
  }.freeze

  def self.find_sti_class(type_name)
    TYPE_TO_STI_CLASS_MAP[type_name]
  end

  # Notes:
  #   data_transfer_agreement_source: Indicates the source of the data transfer
  #     agreement.
  #   data_transfer_agreement_kind: "0", "1", etc.  Indicates which version
  #     of the data transfer agreement string the user to agreed to, for a given
  #     data_transfer_agreement_source.  This value should be bumped each time
  #     the corresponding user-facing string is updated.
  #   gender_student_input: The original string input by the user during account creation.
  #     The normalized single-character gender value is stored in the gender column.
  #   us_state: A 2 letter code United States state code the user has given us.
  #   country_code: The country the user was in when they told us their
  #     us_state.
  #   ai_rubrics_disabled: Turns off AI assessment for a User.
  #   ai_rubrics_tour_seen: Tracks whether user has viewed the AI rubric product tour.
  #   lti_roster_sync_enabled: Enable/disable LTI roster syncing for a User.
  #   user_provided_us_state: Indicates if the us_state was provided by the user as opposed to being interpolated.
  #   failed_attempts and locked_at: Used by Devise#Lockable to prevent
  #     brute-force password attempts
  #   roster_synced: Indicates if the user was created during a roster sync operation from an LMS. Implies that the user
  #     is a school-managed account.
  #   educator_role: Indicates the role of the educator, e.g. 'teacher', 'school_admin', 'district_admin', etc.
  #   signup_sources_tracking: Array of user selections for what brought them to sign up for Code.org.

  CLEVER_ADMIN_USER_TYPES = ['district_admin', 'school_admin'].freeze

  DATA_TRANSFER_AGREEMENT_SOURCE_TYPES = [
    ACCOUNT_SIGN_UP = 'ACCOUNT_SIGN_UP'.freeze,
    ACCEPT_DATA_TRANSFER_DIALOG = 'ACCEPT_DATA_TRANSFER_DIALOG'.freeze
  ].freeze

  # constants for resetting user secret words/picture
  MAX_SECRET_RESET_ATTEMPTS = 5
  RESET_SECRETS = 'reset_secrets'.freeze

  serialized_attrs %w(
    ops_first_name
    ops_last_name
    district_id
    ops_school
    ops_gender
    using_text_mode
    display_theme
    mute_music
    last_seen_school_info_interstitial
    has_seen_standards_report_info_dialog
    oauth_refresh_token
    oauth_token
    oauth_token_expiration
    sharing_disabled
    next_census_display
    donor_teacher_banner_dismissed
    data_transfer_agreement_accepted
    data_transfer_agreement_request_ip
    data_transfer_agreement_source
    data_transfer_agreement_kind
    data_transfer_agreement_at
    parent_email_banner_dismissed
    section_attempts
    section_attempts_last_reset
    share_teacher_email_regional_partner_opt_in
    last_verified_captcha_at
    gender_student_input
    gender_teacher_input
    gender_third_party_input
    us_state
    country_code
    given_name
    family_name
    ai_rubrics_disabled
    ai_rubrics_tour_seen
    ai_tutor_access_denied
    ai_differentiation_toggled_off
    has_seen_ai_assessments_announcement
    has_completed_ai_differentiation_welcome
    sort_by_family_name
    show_progress_table_v2
    has_seen_homepage_welcome
    progress_table_v2_closed_beta
    lti_roster_sync_enabled
    progress_table_v2_timestamp
    progress_table_v1_timestamp
    has_seen_progress_table_v2_invitation
    date_progress_table_invitation_last_delayed
    user_provided_us_state
    lms_landing_opted_out
    failed_attempts
    locked_at
    seen_ta_scores_map
    roster_synced
    educator_role
    signup_sources_tracking
  )

  attr_accessor(
    :login,
    :email_preference_opt_in_required,
    :email_preference_opt_in,
    :email_preference_request_ip,
    :email_preference_source,
    :email_preference_form_kind,
    :parent_email_update_only,
    :parent_email_preference_opt_in_required,
    :parent_email_preference_opt_in,
    :parent_email_preference_email,
    :parent_email_preference_request_ip,
    :parent_email_preference_source,
    :share_teacher_email_reg_partner_opt_in_radio_choice,
    :data_transfer_agreement_required,
    :raw_token,
    :child_users,
  )

  ## Association Macros

  belongs_to :invited_by, polymorphic: true, optional: true
  belongs_to :primary_contact_info, class_name: 'AuthenticationOption', optional: true
  belongs_to :school_info, optional: true
  belongs_to :secret_picture, optional: true
  belongs_to :studio_person, optional: true

  has_many :hint_view_requests
  has_many :teacher_feedbacks, foreign_key: 'teacher_id', dependent: :destroy

  has_many :plc_enrollments, class_name: '::Plc::UserCourseEnrollment', dependent: :destroy

  has_many :user_levels, -> {order(id: :desc)}, inverse_of: :user

  has_many :user_school_infos
  accepts_nested_attributes_for :school_info, reject_if: :preprocess_school_info

  has_many :pd_applications,
    class_name: 'Pd::Application::ApplicationBase',
    dependent: :destroy

  has_many :pd_attendances, class_name: 'Pd::Attendance', foreign_key: :teacher_id

  has_many :sign_ins
  has_many :user_geos, -> {order(updated_at: :desc)}

  has_many :section_instructors, foreign_key: 'instructor_id', dependent: :destroy
  has_many :active_section_instructors, -> {where(status: :active)}, class_name: 'SectionInstructor', foreign_key: 'instructor_id'
  has_many :sections_instructed, -> {without_deleted.where(section_instructors: {deleted_at: nil})}, through: :active_section_instructors, source: :section

  # Relationships (sections_as_students/followeds/teachers) from being a
  # student.
  has_many :followeds, -> {order 'followers.id'}, class_name: 'Follower', foreign_key: 'student_user_id', dependent: :destroy
  has_many :sections_as_student, through: :followeds, source: :section
  has_many :teachers, through: :sections_as_student, source: :instructors

  # Relationships (sections/followers/students) from being a teacher.
  has_many :sections_owned, dependent: :destroy, class_name: 'Section'
  has_many :followers, -> {without_deleted}, through: :sections_instructed
  has_many :students, through: :followers, source: :student_user

  # a bit of trickery to sort most recently started/assigned/progressed scripts first and then completed
  # This SQL string is not at risk for injection vulnerabilites because it's
  # just a hardcoded string, so it's safe to wrap in Arel.sql
  has_many :user_scripts, -> {order Arel.sql("-completed_at asc, greatest(coalesce(started_at, 0), coalesce(assigned_at, 0), coalesce(last_progress_at, 0)) desc, user_scripts.id asc")}
  has_many :scripts, through: :user_scripts, source: :script

  # courses a facilitator is able to teach
  has_many :courses_as_facilitator,
    class_name: 'Pd::CourseFacilitator',
    foreign_key: :facilitator_id,
    dependent: :destroy

  has_many :regional_partner_program_managers,
    foreign_key: :program_manager_id
  has_many :regional_partners,
    through: :regional_partner_program_managers

  has_many :pd_workshops_organized, class_name: 'Pd::Workshop', foreign_key: :organizer_id
  has_and_belongs_to_many :pd_workshops_facilitated, class_name: 'Pd::Workshop', join_table: 'pd_workshops_facilitators', association_foreign_key: 'pd_workshop_id'

  has_many :authentication_options, dependent: :destroy
  accepts_nested_attributes_for :authentication_options

  has_many :lti_user_identities, dependent: :destroy

  has_many :external_notifications, dependent: :destroy

  has_one :latest_parental_permission_request, -> {order(updated_at: :desc)}, class_name: 'ParentalPermissionRequest'

  ## Validation Macros
  validate :complete_school_info, if: :school_info_id_changed?, unless: proc {|u| u.purged_at.present?}

  validates :data_transfer_agreement_accepted, acceptance: true, if: :data_transfer_agreement_required
  validates_presence_of :data_transfer_agreement_request_ip, if: -> {data_transfer_agreement_accepted.present?}
  validates_inclusion_of :data_transfer_agreement_source, in: DATA_TRANSFER_AGREEMENT_SOURCE_TYPES, if: -> {data_transfer_agreement_accepted.present?}
  validates_presence_of :data_transfer_agreement_kind, if: -> {data_transfer_agreement_accepted.present?}
  validates_presence_of :data_transfer_agreement_at, if: -> {data_transfer_agreement_accepted.present?}

  validates :gender_student_input, length: {maximum: 50}, no_utf8mb4: true
  validates :gender_teacher_input, no_utf8mb4: true

  validates :terms_of_service_version,
  inclusion: {in: TERMS_OF_SERVICE_VERSIONS},
  allow_nil: true

  validate :admins_must_be_teachers_without_followeds
  validate :educator_role_allowed_for_teacher, on: :create

  # Only allow admin permission for studio accounts with Google OAuth authentication.
  validate :enforce_google_sso_for_admin

  validate :lti_roster_sync_enabled, if: -> {lti_roster_sync_enabled.present?} do
    self.lti_roster_sync_enabled = ActiveRecord::Type::Boolean.new.cast(lti_roster_sync_enabled)
  end

  validate :validate_parent_email

  validate :validate_us_state, if: :should_validate_us_state?

  # This custom validator makes email collision checks on the AuthenticationOption
  # model also show up as validation errors for the email field on the User
  # model.
  # There's probably some performance cost in additional queries here - once
  # we are fully migrated to multi-auth, we may want to remove this code and
  # check that we handle validation errors from AuthenticationOption everywhere.
  validate if: :migrated? do |user|
    if user.primary_contact_info && !user.primary_contact_info.valid?
      user.primary_contact_info.errors.each {|k, v| user.errors.add k, v}
    end

    user.authentication_options.each do |ao|
      unless ao.valid?
        ao.errors.each {|k, v| user.errors.add k, v}
      end
    end
  end

  # Validate that a user with the same authentication credentials does not already exist.
  validate on: :create, if: -> {uid.present?} do |user|
    # If the user has a unique authentication ID, fail if there is an existing User with that ID.
    other = User.find_by_credential(type: user.provider, id: user.uid)
    user.errors.add(:uid, "User already exists with uid: #{user.uid} and provider: #{user.provider}") unless other.nil?
  end

  validates_presence_of :user_type
  validates_inclusion_of :user_type, in: USER_TYPE_OPTIONS, if: :user_type?

  validates_inclusion_of :educator_role, in: Policies::User::ALLOWED_EDUCATOR_ROLES, if: :educator_role?

  ## Callback Macros

  with_options if: :sponsored? do
    before_create :generate_secret_picture
    before_create :generate_secret_words
  end

  before_create :update_default_share_setting

  before_create :save_show_progress_table_v2

  before_validation :enforce_age_or_state_update, on: :update, if: :should_check_age_or_state_update?

  before_validation on: [:create, :update], if: -> {gender_teacher_input.present? && will_save_change_to_attribute?('properties')} do
    self.gender = Services::User::GenderNormalizer.call(raw_input: gender_teacher_input)
  end

  before_validation on: [:create, :update], if: -> {gender_student_input.present? && will_save_change_to_attribute?('properties')} do
    gender_student_input.strip!
    self.gender = Services::User::GenderNormalizer.call(raw_input: gender_student_input)
  end

  before_validation on: :create, if: -> {gender.present?} do
    self.gender = Services::User::GenderNormalizer.call(raw_input: gender)
  end

  before_validation :normalize_parent_email

  before_validation :update_share_setting

  # NOTE: Order is important here.
  before_save :make_teachers_21,
    :normalize_email,
    :hash_email,
    :sanitize_race_data_set_urm,
    :fix_by_user_type

  before_save :remove_cleartext_emails, if: -> {student? && migrated? && user_type_changed?}

  before_destroy :soft_delete_channels

  after_create :associate_with_potential_pd_enrollments

  after_create if: -> {Policies::Lti.lti? self} do
    Services::Lti.create_lti_user_identity(self)
  end

  after_create :migrate_to_multi_auth

  after_update if: -> {cap_status? && property_previously_changed?(:us_state)} do
    Services::ChildAccount.remove_compliance(self)
  end

  after_save :update_and_add_users_school_infos, if: -> {saved_change_to_school_info_id? || (school_info_id.present? && user_school_infos.empty?)}

  after_destroy :record_soft_delete

  scope :ignore_deleted_at_index, -> {from 'users IGNORE INDEX(index_users_on_deleted_at)'}
  # Include default Devise modules. Others available are:
  # :token_authenticatable, :confirmable, :timeoutable
  devise :invitable, :database_authenticatable, :registerable, :omniauthable,
    :recoverable, :rememberable, :trackable, :lockable

  # Make sure to include these Concerns after we include the default Devise
  # modules, since it's trying to extend some methods added by those modules
  # that would be overridden by them if we included it before.
  include Devise::Models::ManualSessionExpiration
  include Devise::DatabaseAuthenticationOverrides

  acts_as_paranoid # use deleted_at column instead of deleting rows

  # Puts teachers directly into the progress table v2 view when new account is created.
  def save_show_progress_table_v2
    if teacher?
      self.show_progress_table_v2 = true
    end
  end

  # Set validation type to VALIDATION_NONE, and deduplicate the school_info object
  # based on the passed attributes.
  # @param school_info_attr the attributes to set and check
  # @return [Boolean] true if we should reject (ignore and skip writing) the record,
  # false if we should accept and write it
  def preprocess_school_info(school_info_attr)
    # Suppress validation - all parts of this form are optional when accesssed through the registration form
    school_info_attr[:validation_type] = SchoolInfo::VALIDATION_NONE unless school_info_attr.nil?
    # students are never asked to fill out this data, so silently reject it for them
    student? || deduplicate_school_info(school_info_attr, self)
  end

  # takes a new school info object collected somewhere (e.g., PD enrollment) and compares to
  # a user's current school information.
  # overwrites if:
  # new school info object has a NCES school ID associated with it
  # old school info object doesn't have a NCES school ID associated with it
  # @param new_school_info a school_info object to compare to the user current school information.
  def update_school_info(new_school_info)
    if new_school_info.complete?
      self.school_info_id = new_school_info.id
      save(validate: false)
    end
  end

  def update_and_add_users_school_infos
    last_school = user_school_infos.find_by(end_date: nil)
    current_time = DateTime.now
    if last_school
      last_school.end_date = current_time
      last_school.save!
    end
    UserSchoolInfo.create(
      user: self,
      school_info: school_info,
      start_date: last_school ? current_time : created_at,
      last_confirmation_date: current_time
    )
  end

  def complete_school_info
    # Check user_school_infos count to verify if new or existing user
    # If user_school_infos count == 0, new user
    # If user_school_infos count > 0, existing user
    if user_school_infos.count > 0 && !school_info&.complete?
      errors.add(:school_info_id, "cannot add new school id")
    end
  end

  def admins_must_be_teachers_without_followeds
    if admin
      errors.add(:admin, 'must be a teacher') unless teacher?
      errors.add(:admin, 'cannot be a followed') unless sections_as_student.empty?
    end
  end

  def email
    return read_attribute(:email) unless migrated?
    primary_contact_info.try(:email) || ''
  end

  def hashed_email
    return read_attribute(:hashed_email) unless migrated?
    primary_contact_info.try(:hashed_email) || ''
  end

  def alternate_email
    latest_accepted_app = Pd::Application::TeacherApplication.where(user: self, status: 'accepted').order(application_year: :desc).first
    latest_accepted_app&.sanitized_form_data_hash&.dig(:alternate_email)
  end

  # assign a course to a facilitator that is qualified to teach it
  def course_as_facilitator=(course)
    courses_as_facilitator << courses_as_facilitator.find_or_create_by(facilitator_id: id, course: course)
  end

  def delete_course_as_facilitator(course)
    courses_as_facilitator.find_by(course: course).try(:destroy)
  end

  # "sections" previously referred to what is now called :sections_owned.
  def sections
    sections_instructed
  end

  def memoized_teachers
    @memoized_teachers ||= teachers.to_a
  end

  def make_teachers_21
    return unless teacher?
    self.age = 21
  end

  def normalize_email
    return if email.blank?
    self.email = email.strip.downcase
  end

  def hash_email
    return if email.blank?
    self.hashed_email = User.hash_email(email)
  end

  def sanitize_race_data_set_urm
    return unless races_changed?

    self.races = Policies::Races.sanitized(races).join(',')
    self.races = nil if races.empty?
    self.urm = Policies::Races.any_urm?(races)

    # Make sure we explicitly return true here so Rails doesn't interpret a
    # potential `self.urm = false` as us trying to halt the callback chain
    true
  end

  def enforce_google_sso_for_admin
    return unless admin

    errors.add(:admin, 'must be a migrated user') unless migrated?

    # Exception for development and adhoc environments where Google is not available as an authentication provider by default
    return if rack_env?(:development, :adhoc)

    unless (authentication_options.count == 1) && (authentication_options.all? {|ao| ao.google? && ao.codeorg_email?})
      errors.add(:admin, 'must be a code.org account with only google oauth')
    end

    # Code studio admins should not have a password
    errors.add(:admin, 'cannot have a password') if password.present?
  end

  def fix_by_user_type
    if student?
      self.email = ''
      self.full_address = nil
      self.school_info = nil
      studio_person&.destroy!
      self.studio_person_id = nil
    end

    # As we want teachers to explicitly accept our Terms of Service, when the user_type is changing
    # without an explicit acceptance, we clear the version accepted.
    if teacher? && purged_at.nil?
      self.studio_person = StudioPerson.create!(emails: email) unless studio_person
      if user_type_changed? && !terms_of_service_version_changed?
        self.terms_of_service_version = nil
      end
    end
  end

  # Remove all cleartext email addresses (including soft-deleted ones)
  # in migrated students' AuthenticationOptions.
  def remove_cleartext_emails
    authentication_options.with_deleted.update_all(email: '')
  end

  def add_credential(type:, id:, email:, hashed_email:, data:)
    return false unless migrated?
    AuthenticationOption.create(
      user: self,
      email: email,
      hashed_email: hashed_email,
      credential_type: type,
      authentication_id: id,
      data: data
    )
  end

  # Get information for an SSO provider.
  # @param [String] type A credential type / provider type.
  # @returns [AuthenticationOption|Hash|nil] Returns an AuthenticationOption for migrated
  #   users, a Hash for non-migrated users, or nil if there is no matching credential.
  def find_credential(type)
    if migrated?
      authentication_options.find_by(credential_type: type)
    else
      return nil unless provider == type
      {authentication_id: uid, credential_type: provider}
    end
  end

  # For a user signing up with email/password, we require certain fields to be present and valid
  # before the user can move on to the "finish signup" step.
  def validate_for_finish_sign_up
    raise "Cannot call validate_for_finish_sign_up on a persisted user" if persisted?

    valid? # Run all validations

    # For this step, we only care about email, password, and password confirmation.
    # Remove any other validation errors for now.
    required_fields = [:email, :password, :password_confirmation]
    errors.each do |attribute, _|
      errors.delete(attribute) unless required_fields.include?(attribute)
    end

    email_and_hashed_email_must_be_unique # Always check email uniqueness
  end

  def oauth?
    if migrated?
      authentication_options.any?(&:oauth?)
    else
      AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include? provider
    end
  end

  def oauth_only?
    if migrated?
      authentication_options.all?(&:oauth?) && encrypted_password.blank?
    else
      AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include?(provider) && encrypted_password.blank?
    end
  end

  def update_email_for(email:, provider: nil, uid: nil)
    if migrated?
      # Provider and uid are required to update email on AuthenticationOption for migrated user.
      return unless provider.present? && uid.present?
      auth_option = authentication_options.find_by(credential_type: provider, authentication_id: uid)
      auth_option&.update(email: email)
    else
      update(email: email)
    end
  end

  def update_primary_contact_info(new_email: nil, new_hashed_email: nil)
    new_hashed_email = new_email.present? ? User.hash_email(new_email) : new_hashed_email

    return false if new_email.nil? && new_hashed_email.nil?
    return false if teacher? && new_email.nil?

    # If an auth option already exists with this email, it becomes the primary.
    # Otherwise make a new one.
    existing_auth_option = authentication_options.find_by hashed_email: new_hashed_email
    new_primary = existing_auth_option || AuthenticationOption.new(
      user: self,
      credential_type: AuthenticationOption::EMAIL,
      hashed_email: new_hashed_email
    )
    # Whether it's an existing auth option or a new one, always want to set a cleartext email.
    new_primary.email = new_email

    # Even though it's implied, pushing the new option into the
    # authentication_options association now allows our validations to run
    # when we save the user and produce useful error messages when, for example,
    # the email is already taken.
    self.primary_contact_info = new_primary
    authentication_options << new_primary
    success = save

    if success
      # Remove any email authentication options that the user isn't using, since
      # we don't surface them in the UI.
      authentication_options.
        where(credential_type: AuthenticationOption::EMAIL).
        where.not(hashed_email: new_hashed_email).
        destroy_all
    end

    success
  end

  def update_primary_contact_info!(new_email: nil, new_hashed_email: nil)
    success = update_primary_contact_info(new_email: new_email, new_hashed_email: new_hashed_email)
    raise "User's primary contact info was not updated successfully" unless success
    success
  end

  # True if the account is teacher-managed and has any sections that use word logins.
  # Will not be true if the user has a password or is only in picture sections
  def secret_word_account?
    return false unless teacher_managed_account?
    sections_as_student.any? {|section| section.login_type == Section::LOGIN_TYPE_WORD}
  end

  # True if the account is teacher-managed, is in at least one picture section, and
  # is not in any non-picture sections
  def secret_picture_account_only?
    return false unless teacher_managed_account?
    any_sections = !sections_as_student.empty?
    any_sections && sections_as_student.all? {|section| section.login_type == Section::LOGIN_TYPE_PICTURE}
  end

  # True if user is a student in a section that has Google Classroom login type
  def google_classroom_student?
    sections_as_student.find_by_login_type(Section::LOGIN_TYPE_GOOGLE_CLASSROOM).present?
  end

  # True if user is a student in a section that has Clever login type
  def clever_student?
    sections_as_student.find_by_login_type(Section::LOGIN_TYPE_CLEVER).present?
  end

  # True if user is a student in a section that uses any oauth login type
  def oauth_student?
    sections_as_student.find_by_login_type(Section::LOGIN_TYPES_OAUTH).present?
  end

  def user_levels_by_level(script)
    user_levels_for_script = user_levels.
      where(script_id: script.id)
    User.index_user_levels_by_level_id(user_levels_for_script)
  end

  def has_activity?
    user_levels.attempted.exists?
  end

  # Returns the most recent (via updated_at) user_level for the specified
  # level.
  def last_attempt(level, script = nil)
    query = UserLevel.where(user_id: id, level_id: level.id)
    query = query.where(script_id: script.id) unless script.nil?
    query.order(updated_at: :desc).first
  end

  # Returns the most recent (via updated_at) user_level for any of the specified
  # levels.
  def last_attempt_for_any(levels, script_id: nil)
    level_ids = levels.pluck(:id)
    conditions = {
      user_id: id,
      level_id: level_ids
    }
    conditions[:script_id] = script_id unless script_id.nil?
    UserLevel.where(conditions).
      order(updated_at: :desc).
      first
  end

  #sections owned by the user AND not deleted
  def owned_section_ids
    sections_instructed.select(:id).all
  end

  # Is the given unit hidden for this user (based on the sections that they are in)
  def unit_hidden?(unit)
    return false if unit.can_be_instructor?(self)

    return false if sections_as_student.empty?

    # Can't hide a unit that isn't part of a course
    unit_group = unit.try(:unit_group)
    return false unless unit_group

    get_participant_hidden_ids(unit_group.id, false).include?(unit.id)
  end

  # @return {Hash<string,number[]>|number[]}
  #   For teachers, this will be a hash mapping from section id to a list of hidden
  #   lesson ids for that section.
  #   For students this will just be a list of lesson ids that are hidden for them.
  def get_hidden_lesson_ids(unit_name)
    unit = Unit.get_from_cache(unit_name)
    return [] if unit.nil?

    unit.can_be_instructor?(self) ? get_instructor_hidden_ids(true) : get_participant_hidden_ids(unit.id, true)
  end

  # @return {Hash<string,number[]>|number[]}
  #   For teachers, this will be a hash mapping from section id to a list of hidden
  #   unit ids for that section.
  #   For students this will just be a list of unit ids that are hidden for them.
  def get_hidden_unit_ids(unit_group = nil)
    return [] if !teacher? && unit_group.nil?

    # If there isn't a unit_group then we are on the homepage and looking for all the hidden units for an instructor
    return get_instructor_hidden_ids(false) if unit_group.nil?
    unit_group.can_be_instructor?(self) ? get_instructor_hidden_ids(false) : get_participant_hidden_ids(unit_group.id, false)
  end

  def student?
    user_type == TYPE_STUDENT
  end

  def teacher?
    user_type == TYPE_TEACHER
  end

  def levelbuilder?
    permission?(UserPermission::LEVELBUILDER)
  end

  # Students can always access their own work, and teachers can access the work of
  # students in their sections. This is specifically for the student work sample API
  # which allows pulling student work samples to make datasets to gauge accuracy of
  # our AI evaluation tools internally.
  def can_access_student_work?
    permission?(UserPermission::STUDENT_WORK_ACCESS)
  end

  def can_view_all_facilitator_landing_pages?
    permission?(UserPermission::PROGRAM_MANAGER) || permission?(UserPermission::WORKSHOP_ORGANIZER) ||
      permission?(UserPermission::WORKSHOP_ADMIN)
  end

  def student_of_verified_instructor?
    teachers.any?(&:verified_instructor?)
  end

  def student_of?(teacher)
    teachers.include? teacher
  end

  def locale
    read_attribute(:locale).try(:to_sym)
  end

  def confirmation_required?
    false
  end

  def mute_music?
    !!mute_music
  end

  def valid_secret_words?(words)
    return false unless secret_words
    words.delete(' ') == secret_words.delete(' ')
  end

  # override the default devise password to support old and new style hashed passwords
  # based on Devise::Models::DatabaseAuthenticatable#valid_password?
  # https://github.com/plataformatec/devise/blob/master/lib/devise/models/database_authenticatable.rb#L46
  def valid_password?(password)
    return false if encrypted_password.blank?
    bcrypt = ::BCrypt::Password.new(encrypted_password)
    # check with the pepper
    spicy_password = ::BCrypt::Engine.hash_secret("#{password}#{self.class.pepper}", bcrypt.salt)
    if Devise.secure_compare(spicy_password, encrypted_password)
      return true
    end

    # check without the pepper
    mild_password = ::BCrypt::Engine.hash_secret(password, bcrypt.salt)
    if Devise.secure_compare(mild_password, encrypted_password)
      # save the spicy password
      update_attribute(:encrypted_password, spicy_password)
      return true
    end

    return false
  end

  def reset_secrets
    generate_secret_picture
    generate_secret_words
  end

  def generate_secret_picture
    MAX_SECRET_RESET_ATTEMPTS.times do
      new_secret_picture = SecretPicture.random

      # retry if random picture is same as user's current secret picture
      next if new_secret_picture == secret_picture

      self.secret_picture = new_secret_picture
      break
    end
  end

  def generate_secret_words
    MAX_SECRET_RESET_ATTEMPTS.times do
      new_secret_words = [SecretWord.random.word, SecretWord.random.word].join(" ")

      # retry if random words are same as user's current secret words
      next if new_secret_words == secret_words

      self.secret_words = new_secret_words
      break
    end
  end

  # Returns integer days since account creation, rounded down
  def account_age_days
    (DateTime.now - created_at.to_datetime).to_i
  end

  def first_sign_in_date
    sign_ins.find_by(sign_in_count: 1)&.sign_in_at
  end

  def days_since_first_sign_in
    return nil if first_sign_in_date.nil?
    (DateTime.now - first_sign_in_date.to_datetime).to_i
  end

  # This method is called when a section the user belongs to is assigned to
  # a script. We find or create a new UserScript entry, and set assigned_at
  # if not already set.
  # @param script [Unit] The script to assign.
  # @return [UserScript] The UserScript, new or existing, with assigned_at set.
  def assign_script(script)
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      user_script = UserScript.where(user: self, script: script).first_or_create
      user_script.update!(assigned_at: Time.now)
      return user_script
    end
  end

  def can_pair?
    sections_as_student.any?(&:pairing_allowed)
  end

  def can_pair_with?(other_user)
    self != other_user && sections_as_student.any? {|section| other_user.sections_as_student.include? section}
  end

  def to_csv
    User.csv_attributes.map {|attr| send(attr)}
  end

  # Format user information for the JSON API
  def summarize
    {
      id: id,
      name: name,
      username: username,
      given_name: given_name,
      family_name: family_name,
      email: email,
      hashed_email: hashed_email,
      user_type: user_type,
      gender: gender,
      gender_teacher_input: gender_teacher_input,
      birthday: birthday,
      secret_words: secret_words,
      secret_picture_name: secret_picture&.name,
      secret_picture_url: secret_picture && ApplicationController.helpers.image_url(secret_picture.path),
      location: "/v2/users/#{id}",
      age: age,
      sharing_disabled: sharing_disabled?,
      has_ever_signed_in: has_ever_signed_in?,
      ai_tutor_access_denied: !!ai_tutor_access_denied,
      at_risk_age_gated_date: at_risk_age_gated_date,
      child_account_compliance_state: cap_status,
      latest_permission_request_sent_at: latest_parental_permission_request&.updated_at,
      us_state: us_state,
    }
  end

  def summarize_for_workshop
    {
      id: id,
      email: email,
      is_student: user_type == TYPE_STUDENT,
      display_name: name,
      given_name: given_name,
      family_name: family_name,
      school_info: Queries::SchoolInfo.current_school(self),
    }
  end

  def at_risk_age_gated_date
    Policies::ChildAccount::StatePolicies.state_policy(self)&.dig(:lockout_date) unless Policies::ChildAccount.compliant?(self, future: true)
  end

  def has_ever_signed_in?
    current_sign_in_at.present?
  end

  def should_see_edit_email_link?
    if migrated?
      # Hide from students with no password (i.e., oauth-only and sponsored students)
      # since we do not store their cleartext email address and email is not used for login.
      can_edit_email? && !(student? && encrypted_password.blank?)
    else
      can_edit_email? && !oauth?
    end
  end

  def should_see_add_password_form?
    !can_create_personal_login? && # mutually exclusive with personal login UI
      can_edit_password? && encrypted_password.blank?
  end

  def should_disable_user_type?
    user_type.present? && oauth_provided_user_type
  end

  def oauth_provided_user_type
    [AuthenticationOption::CLEVER].include?(provider)
  end

  # We restrict certain users from editing their email address, because we
  # require a current password confirmation to edit email and some users don't
  # have passwords
  def can_edit_email?
    if migrated?
      # Only word/picture account users do not have authentication options
      # and therefore cannot edit their email addresses
      !sponsored?
    else
      encrypted_password.present? || oauth?
    end
  end

  # We restrict certain users from editing their password; in particular, those
  # users that don't have a password because they authenticate via oauth, secret
  # picture, or some other unusual method
  def can_edit_password?
    !sponsored?
  end

  # Whether the current user has permission to change their own account type
  # from the account edit page.
  def can_change_own_user_type?
    if student? # upgrading to teacher
      # Requires ability to edit email because upgrade requires adding a cleartext email address.
      # Students in sections cannot edit user type because teacher/school owns the student's data.
      can_edit_email? && sections_as_student.none? {|section| section.participant_type == Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student}
    else # downgrading to student
      # Teachers with sections cannot downgrade because our validations require sections
      # to be taught by teachers.
      sections_instructed.empty?
    end
  end

  # Whether the current user has permission to delete their own account from
  # the account edit page.
  def can_delete_own_account?
    return true unless student?
    # Teacher-managed student accounts may not delete their own account.
    return false if teacher_managed_account?
    # Students in sections may not delete their own account.
    sections_as_student.empty?
  end

  def shared_sections_with(other_user)
    sections_as_student & other_user.sections_as_student
  end

  def in_code_review_group_with?(other_user)
    (code_review_groups & other_user.code_review_groups).any?
  end

  # Users who might otherwise have orphaned accounts should have the option
  # to create personal logins (using e-mail/password or oauth) so they can
  # continue to use our site without losing progress.
  def can_create_personal_login?
    return false unless student?
    teacher_managed_account? || (migrated? && oauth_only?)
  end

  def teacher_managed_account?
    return false unless student?
    # We consider the account teacher-managed if the student can't reasonably log in on their own.
    # In some cases, a student might have a password but no e-mail (from our old UI)
    return false if encrypted_password.present? && hashed_email.present?
    return false if encrypted_password.present? && parent_email.present?
    # LTI created accounts should not be teacher managed
    return false if Policies::Lti.lti? self
    # Lastly, we check for oauth.
    !oauth?
  end

  def roster_managed_account?
    return false unless student?
    return false if migrated? && authentication_options.many?

    encrypted_password.blank? && sections_as_student.any?(&:externally_rostered?)
  end

  def parent_managed_account?
    student? && parent_email.present? && hashed_email.blank?
  end

  # Returns true when the parent email matches the account email.
  def parent_created_account?
    student? && parent_email.present? && hashed_email == User.hash_email(parent_email)
  end

  # Temporary: Allow single-auth students to add a parent email so it's possible
  # to add a recovery option to their account.  Once they are on multi-auth they
  # can just add an email or another SSO, so this is no longer needed.
  def can_add_parent_email?
    student? && # only students
      !can_create_personal_login? && # mutually exclusive with personal login UI
      !migrated? # only for single-auth
  end

  def no_personal_email?
    under_13? || (hashed_email.blank? && email.blank? && parent_email.present?)
  end

  # Get a section a user is in that is assigned to this script. Look first for
  # sections they are in as a student, otherwise sections they instruct
  def section_for_script(script)
    sections_as_student.find {|section| section.script_id == script.id} ||
      sections_instructed.find {|section| section.script_id == script.id}
  end

  def lesson_extras_enabled?(unit)
    return false unless unit.lesson_extras_available?
    return true if unit.can_be_instructor?(self)

    sections_as_student.any? do |section|
      section.script_id == unit.id && section.lesson_extras
    end
  end

  # Returns the version of our Terms of Service we consider the user as having
  # accepted. For teachers, this is the latest major version of the Terms of
  # Service accepted. For students, this is the latest major version accepted by
  # any their teachers.
  def terms_version
    if teacher?
      return terms_of_service_version
    end
    teachers.pluck(:terms_of_service_version).try(:compact).try(:max)
  end

  # Ideally this would just be called school, but school is already a column
  # on the user table representing the school name
  def school_info_school
    Queries::SchoolInfo.last_complete(self)&.school
  end

  def show_census_teacher_banner?
    # Must have an NCES school to show the banner
    users_school = school_info_school
    teacher? && users_school && (next_census_display.nil? || Time.zone.today >= next_census_display.to_date)
  end

  def within_united_states?
    user_geos.first&.country == 'United States'
  end

  def associate_with_potential_pd_enrollments
    if teacher?
      Pd::Enrollment.where(email: email, user: nil).each do |enrollment|
        enrollment.update(user: self)
      end

      if alternate_email.present?
        Pd::Enrollment.where(email: alternate_email, user: nil).each do |enrollment|
          enrollment.update(user: self)
        end
      end
    end
  end

  # Disable sharing of advanced projects for students under 13 upon
  # account creation
  def update_default_share_setting
    self.sharing_disabled = true if under_13?
  end

  # If the user is not in any sections, set sharing based on age (disabled if under 13).
  def update_share_setting
    if sections_as_student.empty?
      self.sharing_disabled = under_13?
    end
    true
  end

  # When creating an account, we want to look for any channels that got created
  # for this user before they signed in, and if any of them are in our Applab HOC
  # course, we will create a UserScript entry so that they get a course card
  # In addition, we want to have green bubbles for the levels associated with these
  # channels, so we create level progress.
  def generate_progress_from_storage_id(storage_id, script_name = 'applab-intro')
    # applab-intro is not seeded in our minimal test env used on test/CI. We
    # should be able to handle this gracefully
    script = begin
      Unit.get_from_cache(script_name)
    rescue ActiveRecord::RecordNotFound
      nil
    end
    return unless script

    # Find the set of levels this user started
    # Worth noting that because ChannelToken uses levels (rather than script_levels)
    # if a level is used in multiple scripts, we have no way to disambiguate which
    # one a user saw it in, which becomes a challenge if we expand the scope of
    # this beyond our applab-intro script.
    channel_level_ids = ChannelToken.where(storage_id: storage_id).map(&:level_id)

    levels_in_script = script.levels

    # host_level will be self if we don't have a template level
    # Expanding the scope beyond applab-intro would also be a challenge for template
    # levels, as if a template is used in multiple scripts ,we have no way to know
    # which a user saw it in
    hoc_level_ids = levels_in_script.map(&:host_level).map(&:id)

    unless (channel_level_ids & hoc_level_ids).empty?
      User.track_script_progress(id, Unit.get_from_cache(script_name).id)

      # Create user_level entries for the levels associated with channels. In the
      # case of template backed levels, a channel for the template level will result
      # in user_level entries for all levels that use the template
      script.script_levels.each do |script_level|
        script_level.levels.each do |level|
          # When making progress on a template backed level, the channel will be
          # attached to the template level, thus we look to see if we have a channel
          # for the host_level
          next unless channel_level_ids.include?(level.host_level.id)
          User.track_level_progress(
            user_id: id,
            level_id: level.id,
            script_id: script_level.script_id,
            new_result: ActivityConstants::BEST_PASS_RESULT,
            submitted: false,
            level_source_id: nil
          )
        end
      end
    end
  end

  def record_soft_delete
    Cdo::Metrics.push(
      'User',
      [
        {
          metric_name: :SoftDelete,
          dimensions: [
            {name: "Environment", value: CDO.rack_env},
            {name: "UserType", value: user_type},
          ],
          value: 1
        }
      ]
    )
  end

  def has_pilot_experiment?(pilot_name)
    return false unless pilot_name
    SingleUserExperiment.enabled?(user: self, experiment_name: pilot_name)
  end

  def user_storage_id
    @user_storage_id ||= storage_id_for_user_id(id)
  end

  # Via the paranoia gem, undelete / undestroy the deleted / destroyed user and any (dependent)
  # destroys done around the time of the delete / destroy.
  # Note: This does not restore any of the user's permissions, which are hard-deleted.
  # @raise [RuntimeError] If the user is purged.
  def undestroy
    raise 'Unable to restore a purged user' if purged_at

    soft_delete_time = deleted_at

    # Paranoia documentation at https://github.com/rubysherpas/paranoia#usage.
    result = restore(recursive: true, recovery_window: 5.minutes)
    deleted_time = soft_delete_time - 5.minutes
    Projects.new(user_storage_id).restore_if_deleted_after(deleted_time) if user_storage_id
    result
  end

  def depended_upon_for_login?
    students.any?(&:depends_on_teacher_for_login?)
  end

  def depends_on_teacher_for_login?
    # Student depends on teacher for login if their account is teacher-managed or roster-managed
    # and only have one teacher.
    student? && (teacher_managed_account? || roster_managed_account?) && teachers.uniq.one?
  end

  # Returns an array of summarized students that depend on this user.
  # These map to the students that will be deleted if this user deletes their account.
  def dependent_students
    dependent_students = []
    students.uniq.each do |student|
      dependent_students << student.summarize if student.depends_on_teacher_for_login?
    end
    dependent_students
  end

  def providers
    if migrated?
      authentication_options.map(&:credential_type)
    else
      [provider]
    end
  end

  # Returns number of times a user has attempted to join a section in the last 24 hours
  # Returns 0 if no section join attempts
  def num_section_attempts
    section_attempts || 0
  end

  # There are two possible states in which we would want to reset section attempts
  # 1) Initialize for the first time 2) 24 hours have passed since last reset
  def reset_section_attempts?
    # subtracting DateTimes returns the difference of days as a floating point number
    # By casting to an int, we can check whether at least a full day has passed.
    !section_attempts_last_reset || num_section_attempts == 0 || (DateTime.now - DateTime.parse(section_attempts_last_reset)).to_i > 0
  end

  def display_join_section_captcha?
    # If 24 hours has passed since last reset, return false.
    if section_attempts_last_reset && (DateTime.now - DateTime.parse(section_attempts_last_reset)).to_i > 0
      return false
    else
      return num_section_attempts >= 3
    end
  end

  def increment_section_attempts
    if reset_section_attempts?
      self.section_attempts = 0
      self.section_attempts_last_reset = DateTime.now.to_s
    end
    self.section_attempts += 1
    # users can register while joining a section,
    # so we should not save section attempts if new user hasn't been persisted
    save! if persisted?
  end

  # The data returned by this method is set to cookies for the marketing team to
  # use in Google Optimize for segmenting teacher user experience.
  def marketing_segment_data
    return unless teacher?

    {
      locale: read_attribute(:locale),
      account_age_in_years: account_age_in_years,
      grades: grades_being_taught.any? ? grades_being_taught.to_json : nil,
      curriculums: curriculums_being_taught.any? ? curriculums_being_taught.to_json : nil,
      has_attended_pd: has_attended_pd?,
      within_us: within_united_states?,
      school_percent_frl_40_plus: school_stats&.frl_eligible_percent.present? ? school_stats.frl_eligible_percent >= 40 : nil,
      school_title_i: school_stats&.title_i_status,
      school_state: school_info_school&.state
    }
  end

  def code_review_groups
    followeds.filter_map(&:code_review_group)
  end

  # Can be used to identify users in cases where integer IDs may be vulnerable to abuse
  def uuid
    id && Digest::UUID.uuid_v5(Dashboard::Application.config.secret_key_base, id.to_s)
  end

  # @return [String, nil] the user's US state code in the ISO 3166-2:US standard
  def us_state_code
    state = student? ? us_state : school_info&.usa? && school_info&.state
    return if state.blank?

    # Returns `state` if it is a US state code
    return state.upcase if us_state_abbr?(state, include_dc: true)

    # Returns the code of `state` if it is a US state name
    get_us_state_abbr_from_name(state, include_dc: true)
  end

  def us_state_changed?
    # Check if us_state value will change
    will_save_change_to_properties? && properties_change&.first&.[]("us_state") != us_state
  end

  def should_validate_us_state?
    # tracking a user's US State is currently limited to students.
    return false unless user_type == TYPE_STUDENT
    # us_state is only a required field if the User lives in the US.
    return false unless %w[US RD].include? country_code
    new_record? || us_state_changed?
  end

  ## Class Methods

  # Returns an array of users associated with an email address.
  # Will contain all users that have this email either in
  # plaintext, hashed, or as a parent email. Empty array
  # if no associated users are found.
  def self.associated_users(email)
    result = []
    return result if email.blank?

    primary_account = User.find_by_email_or_hashed_email(email)
    result.push(primary_account) if primary_account

    child_accounts = User.where(parent_email: email)
    result += child_accounts

    result
  end

  def self.authenticate_with_section(section:, params:)
    User.authenticate_with_section_and_secret_words(section: section, params: params.slice(:user_id, :secret_words)) ||
      User.authenticate_with_section_and_secret_picture(section: section, params: params.slice(:user_id, :secret_picture_id))
  end

  def self.authenticate_with_section_and_secret_words(section:, params:)
    return if params[:secret_words].blank?
    return if section.login_type != Section::LOGIN_TYPE_WORD

    user = User.joins(:sections_as_student).find_by(
      id: params[:user_id],
      followers: {section: section}
    )

    return unless user&.valid_secret_words?(params[:secret_words])

    user
  end

  def self.authenticate_with_section_and_secret_picture(section:, params:)
    return if params[:secret_picture_id].blank?
    return if section.login_type != Section::LOGIN_TYPE_PICTURE

    User.joins(:sections_as_student).find_by(
      id: params[:user_id],
      secret_picture_id: params[:secret_picture_id],
      followers: {section: section}
    )
  end

  def self.csv_attributes
    # same as in UserSerializer
    [:id, :email, :ops_first_name, :ops_last_name, :district_name, :ops_school, :ops_gender, :races]
  end

  def self.delete_progress_for_unit(user_id:, script_id:)
    raise "User id required" unless user_id
    raise "Script id required" unless script_id

    user_storage_id = storage_id_for_user_id(user_id)

    UserScript.where(user_id: user_id, script_id: script_id).destroy_all
    UserLevel.where(user_id: user_id, script_id: script_id).destroy_all
    ChannelToken.where(storage_id: user_storage_id, script_id: script_id).destroy_all unless user_storage_id.nil?
    TeacherFeedback.where(student_id: user_id, script_id: script_id).destroy_all
    CodeReview.where(user_id: user_id, script_id: script_id).destroy_all
  end

  def self.find_or_create_facilitator(params, invited_by_user)
    find_or_create_teacher(params, invited_by_user, UserPermission::FACILITATOR)
  end

  def self.find_or_create_teacher(params, invited_by_user, permission = nil)
    user = User.find_by_email_or_hashed_email(params[:email])

    if user
      user = user.becomes!(Teacher) unless user.instance_of?(Teacher)
      user.update!(params)
    else
      # initialize new users with name and school
      if params[:ops_first_name] || params[:ops_last_name]
        params[:name] ||= [params[:ops_first_name], params[:ops_last_name]].flatten.join(" ")
      end
      params[:school] ||= params[:ops_school]
      params[:age] ||= 21

      # Devise Invitable's invite! skips validation, so we must first validate the email ourselves.
      # See https://github.com/scambra/devise_invitable/blob/5eb76d259a954927308bfdbab363a473c520748d/lib/devise_invitable/model.rb#L151
      ValidatesEmailFormatOf.validate_email_format(params[:email]).tap do |result|
        raise ArgumentError, "'#{params[:email]}' #{result.first}" unless result.nil?
      end
      user = Teacher.invite!(attributes: params)
      user.update!(invited_by: invited_by_user)
    end

    if permission
      user.permission = permission
      user.save!
    end

    user
  end

  # Given a user_id, username, or email, attempts to find the relevant user
  def self.from_identifier(identifier)
    (identifier.to_i.to_s == identifier && where(id: identifier).first) ||
      where(username: identifier).first ||
      find_by_email_or_hashed_email(identifier)
  rescue ActiveModel::RangeError
    # Given too large of a user id this can produce a range error
    # @see https://app.honeybadger.io/projects/3240/faults/44740400
    nil
  end

  def self.from_omniauth(auth, params, request = nil)
    omniauth_user = find_by_credential(type: auth.provider, id: auth.uid)

    unless omniauth_user
      omniauth_user = create
      initialize_new_oauth_user(omniauth_user, auth, params)

      sti_class = find_sti_class(omniauth_user.user_type)
      omniauth_user = omniauth_user.becomes!(sti_class) if sti_class

      omniauth_user.save
    end

    omniauth_user.update_oauth_credential_tokens(auth)
    omniauth_user
  end

  def self.hash_email(email)
    Digest::MD5.hexdigest(email.downcase)
  end

  # There is a bug (fix: https://codedotorg.atlassian.net/browse/INF-571) where some users have
  # duplicate user levels for the same level. To ensure that we return the relevant user level for
  # each level and not one of the duplicates, the list is first sorted so that the
  # most relevant user levels are at the end. The list is then indexed by level ID, which will
  # pick up the last matching user level in the list.
  def self.index_user_levels_by_level_id(user_levels)
    # Sorts by updated_at asc then id desc
    # the correct user level is the one most recently updated or the first created
    relevant_user_levels_last = user_levels.sort {|a, b| [a.updated_at, b.id] <=> [b.updated_at, a.id]}
    relevant_user_levels_last.index_by(&:level_id)
  end

  def self.initialize_new_oauth_user(user, auth, params)
    user.provider = auth.provider
    user.uid = auth.uid
    user.name = name_from_omniauth auth.info.name
    user.user_type = params['user_type'] || params[:user_type] || auth.info.user_type
    user.user_type = 'teacher' if user.user_type == 'staff' # Powerschool sends through 'staff' instead of 'teacher'

    if user.user_type == User::TYPE_TEACHER
      Teacher.set_teacher_names_from_auth(user, auth)
    else
      user.family_name = auth.info.family_name if auth.info.family_name.present?
    end

    # Store emails, except when using an authentication provider whose emails
    # we don't trust
    user.email = auth.info.email unless user.user_type == 'student' && AuthenticationOption::UNTRUSTED_EMAIL_CREDENTIAL_TYPES.include?(auth.provider)

    # treat clever admin types as teachers
    if CLEVER_ADMIN_USER_TYPES.include? user.user_type
      user.user_type = User::TYPE_TEACHER
    end

    # clever provides us these fields
    if user.user_type == TYPE_TEACHER
      user.age = 21
    else
      # As the omniauth spec (https://github.com/omniauth/omniauth/wiki/Auth-Hash-Schema) does not
      # describe auth.info.dob, it may arrive in a variety of formats. Consequently, we let Rails
      # handle any necessary conversion, setting birthday from auth.info.dob. The later
      # shenanigans ensure that we store the user's age rather than birthday.
      user.birthday = auth.info.dob
      user_age = user.age
      user.birthday = nil
      user.age = user_age
    end

    user.gender_third_party_input = auth.info.gender
    user.gender = Services::User::GenderNormalizer.call(raw_input: auth.info.gender)
    user.roster_synced = params['roster_synced'] || false
  end

  def self.marketing_segment_data_keys
    %w(locale account_age_in_years grades curriculums has_attended_pd within_us school_percent_frl_40_plus school_title_i school_state)
  end

  def self.name_from_omniauth(raw_name)
    return raw_name if raw_name.blank? || raw_name.is_a?(String) # some services just give us a string
    # clever returns a hash instead of a string for name
    "#{raw_name['first']} #{raw_name['last']}".squish
  end

  def self.new_with_session(params, session)
    return super unless PartialRegistration.in_progress? session

    user = new_from_partial_registration(session)

    sti_class = find_sti_class(params[:user_type] || params['user_type'])
    user = user.becomes!(sti_class) if sti_class && !user.instance_of?(sti_class)

    Services::User.assign_form_params(user, params)

    user
  end

  # Override how devise tries to find users by email to reset password
  # to also look for the hashed email. For users who have their email
  # stored hashed (and not in plaintext), we can still allow them to
  # reset their password with their email (by looking up the hash)

  def self.send_reset_password_instructions(attributes = {})
    # override of Devise method
    if attributes[:username].present? && RequestStore.store[:current_user]&.admin?
      Services::User::PasswordResetterByUsername.call(username: attributes[:username])
    else
      Services::User::PasswordResetterByEmail.call(email: attributes[:email])
    end
  end

  # The synchronous handler for the track_level_progress helper.
  # @return [UserLevel]
  def self.track_level_progress(
    user_id:,
    level_id:,
    script_id:,
    new_result:,
    submitted:,
    level_source_id:,
    pairing_user_ids: nil,
    is_navigator: false,
    time_spent: nil,
    locale: nil
  )
    new_level_completed = false
    new_csf_level_perfected = false

    user_level = nil
    script = nil
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      user_level = UserLevel.
        where(user_id: user_id, level_id: level_id, script_id: script_id).
        first_or_initialize

      if !user_level.passing? && ActivityConstants.passing?(new_result)
        new_level_completed = true
      end

      script = Unit.get_from_cache(script_id)
      script_valid = script.csf? && script.name != Unit::COURSE1_NAME
      if (!user_level.perfect? || user_level.best_result == ActivityConstants::MANUAL_PASS_RESULT) &&
          new_result >= ActivityConstants::BEST_PASS_RESULT &&
          script_valid &&
          HintViewRequest.no_hints_used?(user_id, script_id, level_id) &&
          AuthoredHintViewRequest.no_hints_used?(user_id, script_id, level_id)
        new_csf_level_perfected = true
      end

      # Update user_level with the new attempt.
      # We increment the attempt count unless they've already perfected the level.
      user_level.attempts += 1 unless user_level.perfect? && user_level.best_result != ActivityConstants::FREE_PLAY_RESULT
      user_level.best_result = new_result if user_level.best_result.nil? ||
        new_result > user_level.best_result

      user_level.submitted = submitted
      # We only lock levels of type LevelGroup
      # When the student submits an assessment, lock the level so they no
      # longer have access for the remainder of the autolock period
      is_level_group = user_level.level.type == 'LevelGroup'
      if submitted && is_level_group
        user_level.locked = true
      end
      if level_source_id && !is_navigator
        user_level.level_source_id = level_source_id
      end

      total_time_spent = user_level.calculate_total_time_spent(time_spent)
      user_level.time_spent = total_time_spent if total_time_spent

      if locale
        user_level.locale = locale
        user_level.locale_supported = script.supported_locale?(locale)
      end

      user_level.atomic_save!
    end

    if pairing_user_ids&.any? && user_level.level.should_allow_pairing?(script.id)
      pairing_user_ids.each do |navigator_user_id|
        navigator_user_level, _ = User.track_level_progress(
          user_id: navigator_user_id,
          level_id: level_id,
          script_id: script_id,
          new_result: new_result,
          submitted: submitted,
          level_source_id: level_source_id,
          pairing_user_ids: nil,
          is_navigator: true,
          locale: locale,
          time_spent: time_spent
        )
        Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
          PairedUserLevel.find_or_create_by(
            navigator_user_level_id: navigator_user_level.id,
            driver_user_level_id: user_level.id
          )
        end
      end
    end

    if new_level_completed && script_id
      User.track_script_progress(user_id, script_id)
    end

    if new_csf_level_perfected && pairing_user_ids.blank? && !is_navigator
      User.track_proficiency(user_id, script_id, level_id)
    end
    [user_level, new_level_completed]
  end

  # Increases the level counts for the concept-difficulties associated with the
  # completed level.
  def self.track_proficiency(user_id, script_id, level_id)
    level_concept_difficulty = Unit.cache_find_level(level_id).level_concept_difficulty
    return unless level_concept_difficulty

    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      user_proficiency = UserProficiency.where(user_id: user_id).first_or_create!
      time_now = Time.now
      user_proficiency.last_progress_at = time_now

      ConceptDifficulties::CONCEPTS.each do |concept|
        difficulty_number = level_concept_difficulty.send(concept)
        unless difficulty_number.nil?
          user_proficiency.increment_level_count(concept, difficulty_number)
        end
      end

      if user_proficiency.basic_proficiency_at.nil? &&
          user_proficiency.proficient?
        user_proficiency.basic_proficiency_at = time_now
      end

      user_proficiency.save!
    end
  end

  # This method is meant to indicate a user has made progress (i.e. made a milestone
  # post on a particular level) in a script
  def self.track_script_progress(user_id, script_id)
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      user_script = UserScript.where(user_id: user_id, script_id: script_id).first_or_create!
      time_now = Time.now

      user_script.started_at = time_now unless user_script.started_at
      user_script.last_progress_at = time_now
      user_script.completed_at = time_now if !user_script.completed_at && user_script.check_completed?

      user_script.save!
    end
  end

  # Retrieves all user_level objects for the given users, script, and levels.
  # The return value is a hash from user_id to an array of UserLevel objects
  # sorted in descending order by updated_at:
  # {
  #   1: [<UserLevel>, <UserLevel>, ...],
  #   2: [<UserLevel>, <UserLevel>, ...]
  # }
  #
  # A given user with no UserLevel matching the given criteria is omitted from
  # the returned hash. The associated LevelSource data for each UserLevel is also
  # prefetched to prevent n+1 query issues.
  def self.user_levels_by_user(user_ids, script_id, level_ids)
    UserLevel.
      includes(:level_source).
      where({user_id: user_ids, script_id: script_id, level_id: level_ids}).
      order('updated_at DESC').
      group_by(&:user_id)
  end

  # Retrieve all user levels for the designated set of users in the given
  # script, with a single query.
  # @param [Enumerable<User>] users
  # @param [Unit] script
  # @return [Hash] UserLevels by user id by level id
  # Example return value (where 1,2,3 are user ids and 101, 102 are level ids):
  # {
  #   1: {
  #     101: <UserLevel ...>,
  #     102: <UserLevel ...>
  #   },
  #   2: {
  #     101: <UserLevel ...>,
  #     102: <UserLevel ...>
  #   },
  #   3: {}
  # }
  def self.user_levels_by_user_by_level(users, script)
    initial_hash = users.map {|user| [user.id, {}]}.to_h
    UserLevel.where(
      script_id: script.id,
      user_id: users.map(&:id)
    ).
      group_by(&:user_id).
      inject(initial_hash) do |memo, (user_id, user_levels)|
        memo[user_id] = User.index_user_levels_by_level_id(user_levels)
        memo
      end
  end

  # Returns a Hash of US state codes to state names meant for use in dropdown
  # selection inputs for User accounts.
  # Includes a '??' state code for a location not listed.
  def self.us_state_dropdown_options
    {'??' => I18n.t('signup_form.us_state_dropdown_options.other')}.
      merge(SharedConstants::US_STATES.stringify_keys)
  end

  # Find_by Methods

  # Locate an SSO user by SSO provider and associated user id.
  # @param [String] type A credential type / provider type.  In the future this
  #   should always be one of the valid credential types from AuthenticationOption
  # @param [String] id A user id associated with the particular provider.
  # @returns [User|nil]
  def self.find_by_credential(type:, id:)
    authentication_option = AuthenticationOption.find_by(
      credential_type: type,
      authentication_id: id
    )
    authentication_option&.user || User.find_by(provider: type, uid: id)
  end

  # Given a cleartext email, finds the first user that has a matching email.
  # This will not find users (students) who only have hashed_emails stored.
  # For that, use #find_by_email_or_hashed_email.
  # @param [String] email (cleartext)
  # @return [User|nil]
  def self.find_by_email(email)
    return nil if email.blank?
    migrated_user = AuthenticationOption.trusted_email.find_by(email: email)&.user
    migrated_user || User.find_by(email: email)
  end

  # Given an email hash, finds the first user that has a matching email hash.
  # @param [String] hashed_email
  # @return [User|nil]
  def self.find_by_hashed_email(hashed_email)
    return nil if hashed_email.blank?
    migrated_user = AuthenticationOption.trusted_email.find_by(hashed_email: hashed_email)&.user
    migrated_user || User.find_by(hashed_email: hashed_email)
  end

  # Given a cleartext email finds the first user that has a matching email or hash.
  # @param [String] email (cleartext)
  # @return [User|nil]
  def self.find_by_email_or_hashed_email(email)
    return nil if email.blank?
    find_by_hashed_email User.hash_email email
  end

  def self.find_channel_owner(encrypted_channel_id)
    owner_storage_id, _ = storage_decrypt_channel_id(encrypted_channel_id)
    user_id = user_id_for_storage_id(owner_storage_id)
    User.find(user_id)
  rescue ArgumentError, OpenSSL::Cipher::CipherError, ActiveRecord::RecordNotFound
    nil
  end

  # overrides Devise::Authenticatable#find_first_by_auth_conditions
  # see https://github.com/plataformatec/devise/blob/master/lib/devise/models/authenticatable.rb#L245
  def self.find_for_authentication(tainted_conditions)
    max_credential_size = 255
    conditions = devise_parameter_filter.filter(tainted_conditions.dup)
    # we get either a login (username) or hashed_email
    login = conditions.delete(:login)
    if login.present?
      return nil if login.size > max_credential_size || login.utf8mb4?
      Cdo::Metrics.put('User', 'LoginByUsername', 1, {Environment: CDO.rack_env})
      # TODO: multi-auth (@eric, before merge!) have to handle this path, and make sure that whatever
      # indexing problems bit us on the users table don't affect the multi-auth table
      ignore_deleted_at_index.where(
        [
          'username = :value OR email = :value OR hashed_email = :hashed_value',
          {value: login.downcase, hashed_value: hash_email(login.downcase)}
        ]
      ).first
    elsif (hashed_email = conditions.delete(:hashed_email))
      return nil if hashed_email.size > max_credential_size || hashed_email.utf8mb4?
      Cdo::Metrics.put('User', 'LoginByEmail', 1, {Environment: CDO.rack_env})
      return find_by_hashed_email(hashed_email)
    else
      nil
    end
  end

  ## Private Methods

  private def should_check_age_or_state_update?
    return false unless student?
    return false unless %w[US RD].include? country_code
    birthday_changed? || us_state_changed?
  end

  private def enforce_age_or_state_update
    # Create copy of user to mock the user's state before an update.
    user_before_update = User.new(attributes.merge(changed_attributes))
    potentially_locked = Policies::ChildAccount.underage?(user_before_update)
    # The student is in a 'lockout' flow if they are potentially locked out and not unlocked
    if potentially_locked && !Policies::ChildAccount::ComplianceState.permission_granted?(user_before_update)
      # Only teachers can update the US State of CAP covered students
      if us_state_changed? && !RequestStore.store[:current_user]&.teacher?
        errors.add(:us_state,  I18n.t('activerecord.errors.models.user.attributes.lockout_flow'))
      end
      errors.add(:age,  I18n.t('activerecord.errors.models.user.attributes.lockout_flow')) if birthday_changed?
    end
  end

  private def educator_role_allowed_for_teacher
    return if educator_role.blank?

    unless teacher?
      errors.add(:educator_role, "can only be assigned to teachers")
    end
  end

  # Called before_destroy.
  # Soft-deletes any projects and other channel-backed progress belonging to
  # this user.  Unfeatures any featured projects belonging to this user.
  private def soft_delete_channels
    return unless user_storage_id

    project = Projects.new(user_storage_id)
    project_ids = project.get_all_project_ids

    # Unfeature any featured projects owned by the user
    FeaturedProject.
      where(project_id: project_ids, unfeatured_at: nil).
      where.not(featured_at: nil).
      update_all(unfeatured_at: Time.now)

    # Soft-delete all of the user's projects
    project.soft_delete_all
  end

  private def account_age_in_years
    ((Time.now - created_at.to_time) / 1.year).round
  end

  # Returns a list of all grades that the teacher currently has sections for
  private def grades_being_taught
    @grades_being_taught ||= sections_instructed.map(&:grades).flatten.uniq
  end

  # Returns a list of all curriculums that the teacher currently has sections for
  # ex: ["csf", "csd"]
  private def curriculums_being_taught
    @curriculums_being_taught ||= sections_instructed.filter_map {|section| section.script&.curriculum_umbrella}.uniq
  end

  private def has_attended_pd?
    pd_attendances.any?
  end

  private def school_stats
    @school_stats ||= school_info_school&.most_recent_school_stats
  end

  private def hidden_lesson_ids(sections)
    return sections.flat_map(&:section_hidden_lessons).pluck(:stage_id)
  end

  private def hidden_unit_ids(sections)
    return sections.flat_map(&:section_hidden_scripts).pluck(:script_id)
  end

  # This method will extract a list of hidden ids by section. The type of ids depends
  # on the input. If hidden_lessons is true, id is expected to be a unit id and
  # we look for lessons that are hidden. If hidden_lessons is false, id is expected
  # to be a course_id, and we look for hidden units.
  # @param {boolean} hidden_lessons - True if we're looking for hidden lessons, false
  #   if we're looking for hidden units.
  # @return {Hash<string,number[]>
  private def get_instructor_hidden_ids(hidden_lessons)
    # If we're a teacher, we want to go through each of our sections and return
    # a mapping from section id to hidden lessons/units in that section
    hidden_by_section = {}
    sections_instructed.each do |section|
      hidden_by_section[section.id] = hidden_lessons ? hidden_lesson_ids([section]) : hidden_unit_ids([section])
    end
    hidden_by_section
  end

  # This method method will go through each of the sections in which we're a member
  # and determine which lessons/units should be hidden
  # @param {boolean} hidden_lessons - True if we're looking for hidden lessons, false
  #   if we're looking for hidden units.
  # @return {number[]} Set of lesson/unit ids that should be hidden
  private def get_participant_hidden_ids(assign_id, hidden_lessons)
    sections = sections_as_student
    return [] if sections.empty?

    sections = sections.reject(&:hidden)
    assigned_sections = sections.select do |section|
      hidden_lessons ? section.script_id == assign_id : section.course_id == assign_id
    end

    if assigned_sections.empty?
      # if we have no sections matching this assignment, we consider a lesson/unit
      # hidden if any of our sections hides it
      return (hidden_lessons ? hidden_lesson_ids(sections) : hidden_unit_ids(sections)).uniq
    else
      # if we do have sections matching this assignment, we consider a lesson/unit
      # hidden only if it is hidden in every one of the sections the student belongs
      # to that match this assignment
      all_ids = hidden_lessons ? hidden_lesson_ids(assigned_sections) : hidden_unit_ids(assigned_sections)

      counts = all_ids.each_with_object(Hash.new(0)) {|id, hash| hash[id] += 1}
      return counts.select {|_, val| val == assigned_sections.length}.keys
    end
  end

  private def normalize_parent_email
    self.parent_email = nil if parent_email.blank?
  end

  # Parent email is not required, but if it is present, it must be a
  # well-formed email address.
  private def validate_parent_email
    errors.add(:parent_email) unless parent_email.nil? ||
      Cdo::EmailValidator.email_address?(parent_email)
  end

  # Verifies that the serialized attribute "us_state" is a 2 character string
  # representing a US State or "??" which represents a "N/A" kind of response.
  private def validate_us_state
    # us_state must be selected.
    if us_state.blank?
      errors.add(:us_state, :blank)
      return
    end
    # Report an error if an invalid value was submitted (probably tampering).
    unless User.us_state_dropdown_options.include?(us_state)
      errors.add(:us_state, :invalid)
    end
  end
end

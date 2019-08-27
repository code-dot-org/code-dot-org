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
#
# Indexes
#
#  index_users_on_birthday                             (birthday)
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
#  index_users_on_username_and_deleted_at              (username,deleted_at) UNIQUE
#

require 'digest/md5'
require 'cdo/aws/metrics'
require 'cdo/user_helpers'
require 'cdo/race_interstitial_helper'
require 'school_info_interstitial_helper'
require 'sign_up_tracking'

class User < ActiveRecord::Base
  include SerializedProperties
  include SchoolInfoDeduplicator
  include LocaleHelper
  include UserMultiAuthHelper
  include UserPermissionGrantee
  include PartialRegistration
  include Rails.application.routes.url_helpers

  # Notes:
  #   data_transfer_agreement_source: Indicates the source of the data transfer
  #     agreement.
  #   data_transfer_agreement_kind: "0", "1", etc.  Indicates which version
  #     of the data transfer agreement string the user to agreed to, for a given
  #     data_transfer_agreement_source.  This value should be bumped each time
  #     the corresponding user-facing string is updated.
  serialized_attrs %w(
    ops_first_name
    ops_last_name
    district_id
    ops_school
    ops_gender
    using_text_mode
    last_seen_school_info_interstitial
    oauth_refresh_token
    oauth_token
    oauth_token_expiration
    sharing_disabled
    next_census_display
    data_transfer_agreement_accepted
    data_transfer_agreement_request_ip
    data_transfer_agreement_source
    data_transfer_agreement_kind
    data_transfer_agreement_at
    seen_oauth_connect_dialog
  )

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable
  devise :invitable, :database_authenticatable, :registerable, :omniauthable,
    :recoverable, :rememberable, :trackable

  acts_as_paranoid # use deleted_at column instead of deleting rows

  PROVIDER_MANUAL = 'manual'.freeze # "old" user created by a teacher -- logs in w/ username + password
  PROVIDER_SPONSORED = 'sponsored'.freeze # "new" user created by a teacher -- logs in w/ name + secret picture/word
  PROVIDER_MIGRATED = 'migrated'.freeze
  after_create_commit :migrate_to_multi_auth

  # Powerschool note: the Powerschool plugin lives at https://github.com/code-dot-org/powerschool
  OAUTH_PROVIDERS = %w(
    clever
    facebook
    google_oauth2
    lti_lti_prod_kids.qwikcamps.com
    the_school_project
    twitter
    windowslive
    microsoft_v2_auth
    powerschool
  ).freeze

  OAUTH_PROVIDERS_UNTRUSTED_EMAIL = %w(
    clever
    powerschool
  ).freeze

  SYSTEM_DELETED_USERNAME = 'sys_deleted'

  # constants for resetting user secret words/picture
  RESET_SECRETS = 'reset_secrets'.freeze
  MAX_SECRET_RESET_ATTEMPTS = 5

  # :user_type is locked. Use the :permissions property for more granular user permissions.
  USER_TYPE_OPTIONS = [
    TYPE_STUDENT = 'student'.freeze,
    TYPE_TEACHER = 'teacher'.freeze
  ].freeze
  validates_inclusion_of :user_type, in: USER_TYPE_OPTIONS

  belongs_to :studio_person
  has_many :hint_view_requests

  # courses a facilitator is able to teach
  has_many :courses_as_facilitator,
    class_name: Pd::CourseFacilitator,
    foreign_key: :facilitator_id,
    dependent: :destroy

  has_many :regional_partner_program_managers,
    foreign_key: :program_manager_id
  has_many :regional_partners,
    through: :regional_partner_program_managers

  has_many :pd_workshops_organized, class_name: 'Pd::Workshop', foreign_key: :organizer_id

  has_many :authentication_options, dependent: :destroy
  belongs_to :primary_contact_info, class_name: 'AuthenticationOption'

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

  has_many :teacher_feedbacks, foreign_key: 'teacher_id', dependent: :destroy

  belongs_to :school_info
  accepts_nested_attributes_for :school_info, reject_if: :preprocess_school_info
  validates_presence_of :school_info, unless: :school_info_optional?

  has_many :user_school_infos
  after_save :update_and_add_users_school_infos, if: :school_info_id_changed?
  validate :complete_school_info, if: :school_info_id_changed?, unless: proc {|u| u.purged_at.present?}

  has_one :circuit_playground_discount_application

  has_many :pd_applications,
    class_name: 'Pd::Application::ApplicationBase',
    dependent: :destroy

  has_many :user_geos, -> {order 'updated_at desc'}

  before_validation :normalize_parent_email
  validate :validate_parent_email

  after_create :associate_with_potential_pd_enrollments

  after_save :save_email_preference, if: -> {email_preference_opt_in.present?}

  before_destroy :soft_delete_channels

  def save_email_preference
    if teacher?
      EmailPreference.upsert!(
        email: email,
        opt_in: email_preference_opt_in.downcase == "yes",
        ip_address: email_preference_request_ip,
        source: email_preference_source,
        form_kind: email_preference_form_kind,
      )
    end
  end

  # after_create :send_new_teacher_email
  # def send_new_teacher_email
  # TODO: it's not easy to pass cookies into an after_create call, so for now while this is behind a page mode
  # flag, we send the email from the controller instead. This should ultimately live here, though.
  # TeacherMailer.new_teacher_email(self).deliver_now if teacher?
  # end

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

  # Not deployed to everyone, so we don't require this for anybody, yet
  def school_info_optional?
    true # update if/when A/B test is done and accepted
  end

  # Most recently created user_school_info referring to a complete school_info entry
  def last_complete_user_school_info
    user_school_infos.
      includes(:school_info).
      select {|usi| usi.school_info.complete?}.
      sort_by(&:created_at).
      last
  end

  def last_complete_school_info
    last_complete_user_school_info&.school_info
  end

  belongs_to :invited_by, polymorphic: true

  validate :admins_must_be_teachers_without_followeds

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

  # assign a course to a facilitator that is qualified to teach it
  def course_as_facilitator=(course)
    courses_as_facilitator << courses_as_facilitator.find_or_create_by(facilitator_id: id, course: course)
  end

  def delete_course_as_facilitator(course)
    courses_as_facilitator.find_by(course: course).try(:destroy)
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

  def self.find_or_create_teacher(params, invited_by_user, permission = nil)
    user = User.find_by_email_or_hashed_email(params[:email])

    if user
      user.update!(params.merge(user_type: TYPE_TEACHER))
    else
      # initialize new users with name and school
      if params[:ops_first_name] || params[:ops_last_name]
        params[:name] ||= [params[:ops_first_name], params[:ops_last_name]].flatten.join(" ")
      end
      params[:school] ||= params[:ops_school]
      params[:user_type] = TYPE_TEACHER
      params[:age] ||= 21

      # Devise Invitable's invite! skips validation, so we must first validate the email ourselves.
      # See https://github.com/scambra/devise_invitable/blob/5eb76d259a954927308bfdbab363a473c520748d/lib/devise_invitable/model.rb#L151
      ValidatesEmailFormatOf.validate_email_format(params[:email]).tap do |result|
        raise ArgumentError, "'#{params[:email]}' #{result.first}" unless result.nil?
      end
      user = User.invite!(attributes: params)
      user.update!(invited_by: invited_by_user)
    end

    if permission
      user.permission = permission
      user.save!
    end

    user
  end

  def self.find_or_create_facilitator(params, invited_by_user)
    find_or_create_teacher(params, invited_by_user, UserPermission::FACILITATOR)
  end

  DATA_TRANSFER_AGREEMENT_SOURCE_TYPES = [
    ACCOUNT_SIGN_UP = 'ACCOUNT_SIGN_UP'.freeze,
    ACCEPT_DATA_TRANSFER_DIALOG = 'ACCEPT_DATA_TRANSFER_DIALOG'.freeze
  ].freeze

  attr_accessor :login
  attr_accessor :email_preference_opt_in_required
  attr_accessor :email_preference_opt_in
  attr_accessor :email_preference_request_ip
  attr_accessor :email_preference_source
  attr_accessor :email_preference_form_kind

  attr_accessor :data_transfer_agreement_required

  has_many :plc_enrollments, class_name: '::Plc::UserCourseEnrollment', dependent: :destroy

  has_many :user_levels, -> {order 'id desc'}, inverse_of: :user

  has_many :gallery_activities, -> {order 'id desc'}

  # Relationships (sections/followers/students) from being a teacher.
  has_many :sections, dependent: :destroy
  has_many :followers, through: :sections
  has_many :students, through: :followers, source: :student_user

  # Relationships (sections_as_students/followeds/teachers) from being a
  # student.
  has_many :followeds, -> {order 'followers.id'}, class_name: 'Follower', foreign_key: 'student_user_id', dependent: :destroy
  has_many :sections_as_student, through: :followeds, source: :section
  has_many :teachers, through: :sections_as_student, source: :user

  belongs_to :secret_picture
  before_create :generate_secret_picture

  before_create :generate_secret_words

  before_create :update_default_share_setting

  # a bit of trickery to sort most recently started/assigned/progressed scripts first and then completed
  has_many :user_scripts, -> {order "-completed_at asc, greatest(coalesce(started_at, 0), coalesce(assigned_at, 0), coalesce(last_progress_at, 0)) desc, user_scripts.id asc"}
  has_many :scripts, -> {where hidden: false}, through: :user_scripts, source: :script

  validates :name, presence: true, unless: -> {purged_at}
  validates :name, length: {within: 1..70}, allow_blank: true
  validates :name, no_utf8mb4: true

  defer_age = proc {|user| %w(google_oauth2 clever powerschool).include?(user.provider) || user.sponsored?}

  validates :age, presence: true, on: :create, unless: defer_age # only do this on create to avoid problems with existing users
  AGE_DROPDOWN_OPTIONS = (4..20).to_a << "21+"
  validates :age, presence: false, inclusion: {in: AGE_DROPDOWN_OPTIONS}, allow_blank: true

  USERNAME_REGEX = /\A#{UserHelpers::USERNAME_ALLOWED_CHARACTERS.source}+\z/i
  validates_length_of :username, within: 5..20, allow_blank: true
  validates_format_of :username, with: USERNAME_REGEX, on: :create, allow_blank: true
  validates_uniqueness_of :username, allow_blank: true, case_sensitive: false, on: :create, if: 'errors.blank?'
  validates_uniqueness_of :username, case_sensitive: false, on: :update, if: 'errors.blank? && username_changed?'
  validates_presence_of :username, if: :username_required?
  before_validation :generate_username, on: :create

  validates_presence_of     :password, if: :password_required?
  validates_confirmation_of :password, if: :password_required?
  validates_length_of       :password, within: 6..128, allow_blank: true

  validate :email_matches_for_oauth_upgrade, if: 'oauth? && user_type_changed?', on: :update

  def email_matches_for_oauth_upgrade
    if user_type == User::TYPE_TEACHER
      # The stored email must match the passed email
      unless hashed_email == hashed_email_was
        errors.add :base, I18n.t('devise.registrations.user.user_type_change_email_mismatch')
        errors.add :email_mismatch, "Email mismatch" # only used to check for this error's existence
      end
    end
    true
  end

  validates_presence_of :email_preference_opt_in, if: :email_preference_opt_in_required
  validates_presence_of :email_preference_request_ip, if: -> {email_preference_opt_in.present?}
  validates_presence_of :email_preference_source, if: -> {email_preference_opt_in.present?}
  validates_presence_of :email_preference_form_kind, if: -> {email_preference_opt_in.present?}

  validates :data_transfer_agreement_accepted, acceptance: true, if: :data_transfer_agreement_required
  validates_presence_of :data_transfer_agreement_request_ip, if: -> {data_transfer_agreement_accepted.present?}
  validates_inclusion_of :data_transfer_agreement_source, in: DATA_TRANSFER_AGREEMENT_SOURCE_TYPES, if: -> {data_transfer_agreement_accepted.present?}
  validates_presence_of :data_transfer_agreement_kind, if: -> {data_transfer_agreement_accepted.present?}
  validates_presence_of :data_transfer_agreement_at, if: -> {data_transfer_agreement_accepted.present?}

  # When adding a new version, append to the end of the array
  # using the next increasing natural number.
  TERMS_OF_SERVICE_VERSIONS = [
    1  # (July 2016) Teachers can grant access to labs for U13 students.
  ].freeze
  validates :terms_of_service_version,
    inclusion: {in: TERMS_OF_SERVICE_VERSIONS},
    allow_nil: true

  # NOTE: Order is important here.
  before_save :make_teachers_21,
    :normalize_email,
    :hash_email,
    :sanitize_race_data_set_urm,
    :fix_by_user_type
  before_save :remove_cleartext_emails, if: -> {student? && migrated? && user_type_changed?}

  before_validation :update_share_setting, unless: :under_13?

  def make_teachers_21
    return unless teacher?
    self.age = 21
  end

  def normalize_email
    return unless email.present?
    self.email = email.strip.downcase
  end

  def self.hash_email(email)
    Digest::MD5.hexdigest(email.downcase)
  end

  def hash_email
    return unless email.present?
    self.hashed_email = User.hash_email(email)
  end

  def sanitize_race_data_set_urm
    self.races = Race.sanitize(races)
    self.urm = Race.any_urm?(races)
  end

  def fix_by_user_type
    if student?
      self.email = ''
      self.full_address = nil
      self.school_info = nil
      studio_person.destroy! if studio_person
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

  # Given a cleartext email finds the first user that has a matching email or hash.
  # @param [String] email (cleartext)
  # @return [User|nil]
  def self.find_by_email_or_hashed_email(email)
    return nil if email.blank?
    find_by_hashed_email User.hash_email email
  end

  # Given a cleartext email, finds the first user that has a matching email.
  # This will not find users (students) who only have hashed_emails stored.
  # For that, use #find_by_email_or_hashed_email.
  # @param [String] email (cleartext)
  # @return [User|nil]
  def self.find_by_email(email)
    return nil if email.blank?
    migrated_user = AuthenticationOption.find_by(email: email)&.user
    migrated_user || User.find_by(email: email)
  end

  # Given an email hash, finds the first user that has a matching email hash.
  # @param [String] hashed_email
  # @return [User|nil]
  def self.find_by_hashed_email(hashed_email)
    return nil if hashed_email.blank?
    migrated_user = AuthenticationOption.find_by(hashed_email: hashed_email)&.user
    migrated_user || User.find_by(hashed_email: hashed_email)
  end

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

  def self.find_channel_owner(encrypted_channel_id)
    owner_storage_id, _ = storage_decrypt_channel_id(encrypted_channel_id)
    user_id = PEGASUS_DB[:user_storage_ids].first(id: owner_storage_id)[:user_id]
    User.find(user_id)
  rescue ArgumentError, OpenSSL::Cipher::CipherError, ActiveRecord::RecordNotFound
    nil
  end

  validate :presence_of_email, if: -> {teacher? && purged_at.nil?}
  validate :presence_of_email_or_hashed_email, if: :email_required?, on: :create
  validates :email, no_utf8mb4: true
  validates_email_format_of :email, allow_blank: true, if: :email_changed?, unless: -> {email.to_s.utf8mb4?}
  validate :email_and_hashed_email_must_be_unique, if: 'email_changed? || hashed_email_changed?'
  validate :presence_of_hashed_email_or_parent_email, if: :requires_email?

  def requires_email?
    provider_changed? && provider.nil? && encrypted_password_changed? && encrypted_password.present?
  end

  def presence_of_hashed_email_or_parent_email
    if hashed_email.blank? && parent_email.blank?
      errors.add :email, I18n.t('activerecord.errors.messages.blank')
    end
  end

  def presence_of_email
    if email.blank?
      errors.add :email, I18n.t('activerecord.errors.messages.blank')
    end
  end

  def presence_of_email_or_hashed_email
    if email.blank? && hashed_email.blank?
      errors.add :email, I18n.t('activerecord.errors.messages.blank')
    end
  end

  def email_and_hashed_email_must_be_unique
    # skip the db lookup if we are already invalid
    return unless errors.blank?

    if ((email.present? && (other_user = User.find_by_email_or_hashed_email(email))) ||
        (hashed_email.present? && (other_user = User.find_by_hashed_email(hashed_email)))) &&
        other_user != self
      errors.add :email, I18n.t('errors.messages.taken')
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

  def self.name_from_omniauth(raw_name)
    return raw_name if raw_name.blank? || raw_name.is_a?(String) # some services just give us a string
    # clever returns a hash instead of a string for name
    "#{raw_name['first']} #{raw_name['last']}".squish
  end

  CLEVER_ADMIN_USER_TYPES = ['district_admin', 'school_admin'].freeze
  def self.from_omniauth(auth, params, session = nil)
    omniauth_user = find_by_credential(type: auth.provider, id: auth.uid)

    unless omniauth_user
      omniauth_user = create do |user|
        initialize_new_oauth_user(user, auth, params)
      end
      SignUpTracking.log_sign_up_result(omniauth_user, session)
    end

    omniauth_user.update_oauth_credential_tokens(auth)
    omniauth_user
  end

  def self.initialize_new_oauth_user(user, auth, params)
    user.provider = auth.provider
    user.uid = auth.uid
    user.name = name_from_omniauth auth.info.name
    user.user_type = params['user_type'] || auth.info.user_type
    user.user_type = 'teacher' if user.user_type == 'staff' # Powerschool sends through 'staff' instead of 'teacher'

    # Store emails, except when using Clever
    user.email = auth.info.email unless user.user_type == 'student' && OAUTH_PROVIDERS_UNTRUSTED_EMAIL.include?(auth.provider)

    if OAUTH_PROVIDERS_UNTRUSTED_EMAIL.include?(auth.provider) && User.find_by_email_or_hashed_email(user.email)
      user.email = user.email + '.oauthemailalreadytaken'
    end

    if auth.provider == :the_school_project
      user.username = auth.extra.raw_info.nickname
      user.user_type = auth.extra.raw_info.role
      user.locale = auth.extra.raw_info.locale
      user.school = auth.extra.raw_info.school.name
    end

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
    user.gender = Gender.normalize auth.info.gender
  end

  def oauth?
    if migrated?
      authentication_options.any?(&:oauth?)
    else
      OAUTH_PROVIDERS.include? provider
    end
  end

  def oauth_only?
    if migrated?
      authentication_options.all?(&:oauth?) && encrypted_password.blank?
    else
      OAUTH_PROVIDERS.include?(provider) && encrypted_password.blank?
    end
  end

  def self.new_with_session(params, session)
    return super unless PartialRegistration.in_progress? session
    new_from_partial_registration session do |user|
      user.attributes = params
    end
  end

  def managing_own_credentials?
    if provider.blank?
      true
    elsif manual?
      true
    elsif migrated?
      authentication_options.any? do |ao|
        ao.credential_type == AuthenticationOption::EMAIL
      end
    else
      false
    end
  end

  def password_required?
    # Password is not required if the user is not managing their own account
    # (i.e., someone is creating their account for them or the user is using OAuth).
    return false unless managing_own_credentials?

    # Password is required for:
    # New users with no encrypted_password set and users changing their password.
    new_without_password = !persisted? && encrypted_password.blank?
    is_changing_password = password.present? || password_confirmation.present?
    new_without_password || is_changing_password
  end

  def email_required?
    return true if teacher?
    return false if manual?
    return false if sponsored?
    return false if oauth?
    return false if parent_managed_account?
    true
  end

  def username_required?
    manual? || username_changed?
  end

  def update_without_password(params, *options)
    if params[:races]
      self.races = params[:races].join ','
    end
    params.delete(:races)
    super
  end

  def update_with_password(params, *options)
    if encrypted_password.blank?
      params.delete(:current_password) # user does not have password so current password is irrelevant
      update_attributes(params, *options)
    else
      super
    end
  end

  def update_email_for(provider: nil, uid: nil, email:)
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

  def upgrade_to_personal_login(params)
    return false unless student?

    if secret_word_account? && !valid_secret_words?(params[:secret_words])
      error = params[:secret_words].blank? ? :blank_plural : :invalid_plural
      errors.add(:secret_words, error)
      return false
    end

    unless migrated?
      params[:provider] = nil # Set provider to nil to mark the account as self-managed
      return update(params)
    end

    email = params.delete(:email)
    hashed_email = params.delete(:hashed_email)
    should_update_contact_info = email.present? || hashed_email.present?
    transaction do
      update_primary_contact_info!(new_email: email, new_hashed_email: hashed_email) if should_update_contact_info
      update!(params)
    end
  rescue
    false # Relevant errors are set on the user model, so we rescue and return false here.
  end

  def set_user_type(user_type, email = nil, email_preference = nil)
    case user_type
    when TYPE_TEACHER
      upgrade_to_teacher(email, email_preference)
    when TYPE_STUDENT
      downgrade_to_student
    else
      false # Unexpected user type
    end
  end

  def downgrade_to_student
    return true if student? # No-op if user is already a student
    update(user_type: TYPE_STUDENT)
  end

  def upgrade_to_teacher(email, email_preference = nil)
    return true if teacher? # No-op if user is already a teacher
    return false unless email.present?

    hashed_email = User.hash_email(email)
    self.user_type = TYPE_TEACHER

    new_attributes = email_preference.nil? ? {} : email_preference

    transaction do
      if migrated?
        update_primary_contact_info!(new_email: email, new_hashed_email: hashed_email)
      else
        new_attributes[:email] = email
      end
      update!(new_attributes)
    end
  rescue
    false # Relevant errors are set on the user model, so we rescue and return false here.
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

  # overrides Devise::Authenticatable#find_first_by_auth_conditions
  # see https://github.com/plataformatec/devise/blob/master/lib/devise/models/authenticatable.rb#L245
  def self.find_for_authentication(tainted_conditions)
    max_credential_size = 255
    conditions = devise_parameter_filter.filter(tainted_conditions.dup)
    # we get either a login (username) or hashed_email
    login = conditions.delete(:login)
    if login.present?
      return nil if login.size > max_credential_size || login.utf8mb4?
      # TODO: multi-auth (@eric, before merge!) have to handle this path, and make sure that whatever
      # indexing problems bit us on the users table don't affect the multi-auth table
      from("users IGNORE INDEX(index_users_on_deleted_at)").where(
        [
          'username = :value OR email = :value OR hashed_email = :hashed_value',
          {value: login.downcase, hashed_value: hash_email(login.downcase)}
        ]
      ).first
    elsif (hashed_email = conditions.delete(:hashed_email))
      return nil if hashed_email.size > max_credential_size || hashed_email.utf8mb4?
      return find_by_hashed_email(hashed_email)
    else
      nil
    end
  end

  def self.authenticate_with_section(section:, params:)
    User.authenticate_with_section_and_secret_words(section: section, params: params.slice(:user_id, :secret_words)) ||
      User.authenticate_with_section_and_secret_picture(section: section, params: params.slice(:user_id, :secret_picture_id))
  end

  def self.authenticate_with_section_and_secret_words(section:, params:)
    return if section.login_type != Section::LOGIN_TYPE_WORD

    User.
      joins('inner join followers on followers.student_user_id = users.id').
      find_by(
        id: params[:user_id],
        secret_words: params[:secret_words],
        'followers.section_id' => section.id
      )
  end

  def self.authenticate_with_section_and_secret_picture(section:, params:)
    return if section.login_type != Section::LOGIN_TYPE_PICTURE

    User.
      joins('inner join followers on followers.student_user_id = users.id').
      find_by(
        id: params[:user_id],
        secret_picture_id: params[:secret_picture_id],
        'followers.section_id' => section.id
      )
  end

  def user_levels_by_level(script)
    user_levels.
      where(script_id: script.id).
      index_by(&:level_id)
  end

  # Retrieve all user levels for the designated set of users in the given
  # script, with a single query.
  # @param [Enumerable<User>] users
  # @param [Script] script
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
    initial_hash = Hash[users.map {|user| [user.id, {}]}]
    UserLevel.where(
      script_id: script.id,
      user_id: users.map(&:id)
    ).
      group_by(&:user_id).
      inject(initial_hash) do |memo, (user_id, user_levels)|
        memo[user_id] = user_levels.index_by(&:level_id)
        memo
      end
  end

  def user_progress_by_stage(stage)
    levels = stage.script_levels.map(&:level_ids).flatten
    user_levels.where(script: stage.script, level: levels).pluck(:level_id, :best_result).to_h
  end

  def user_level_for(script_level, level)
    user_levels.find_by(
      script_id: script_level.script_id,
      level_id: level.id
    )
  end

  def has_activity?
    user_levels.attempted.exists?
  end

  # Returns the next script_level for the next progression level in the given
  # script that hasn't yet been passed, starting its search at the last level we submitted
  def next_unpassed_progression_level(script)
    # some of our user_levels may be for levels within level_groups, or for levels
    # that are no longer in this script. we want to ignore those, and only look
    # user_levels that have matching script_levels
    # Worth noting in the case that we have the same level appear in
    # the script in multiple places (i.e. via level swapping) there's some potential
    # for strange behavior.
    sl_level_ids = script.script_levels.map(&:level_ids).flatten
    ul_with_sl = user_levels_by_level(script).select do |level_id, _ul|
      sl_level_ids.include? level_id
    end

    # Find the user_level that we've most recently had progress on
    user_level = ul_with_sl.values.max_by(&:updated_at)

    script_level_index = 0
    if user_level
      last_script_level = user_level.script_level
      script_level_index = last_script_level.chapter - 1 if last_script_level
    end

    next_unpassed = script.script_levels[script_level_index..-1].try(:detect) do |script_level|
      user_levels = script_level.level_ids.map {|id| ul_with_sl[id]}
      unpassed_progression_level?(script_level, user_levels)
    end

    # if we don't have any unpassed levels proceeding the one we've most recently
    # submitted, just go to the one we've most recently submitted
    next_unpassed || last_script_level
  end

  # Returns true if all progression levels in the provided script have a passing
  # result
  def completed_progression_levels?(script)
    user_levels_by_level = user_levels_by_level(script)

    script.script_levels.none? do |script_level|
      user_levels = script_level.level_ids.map {|id| user_levels_by_level[id]}
      unpassed_progression_level?(script_level, user_levels)
    end
  end

  # Return true if script_level is a valid_progression_level and every
  # user_level is either missing or not passing
  def unpassed_progression_level?(script_level, user_levels)
    script_level.valid_progression_level? && user_levels.all? do |user_level|
      !(user_level && user_level.passing?)
    end
  end

  # Returns the most recent (via updated_at) user_level for the specified
  # level.
  def last_attempt(level, script = nil)
    query = UserLevel.where(user_id: id, level_id: level.id)
    query = query.where(script_id: script.id) unless script.nil?
    query.order('updated_at DESC').first
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
      order('updated_at DESC').
      first
  end

  # Is the provided script_level hidden, on account of the section(s) that this
  # user is enrolled in
  def script_level_hidden?(script_level)
    return false if try(:teacher?)

    sections = sections_as_student
    return false if sections.empty?

    script_sections = sections.select {|s| s.script.try(:id) == script_level.script.id}

    if !script_sections.empty?
      # if we have one or more sections matching this script id, we consider a stage hidden if all of those sections
      # hides the stage
      script_sections.all? {|s| script_level.hidden_for_section?(s.id)}
    else
      # if we have no sections matching this script id, we consider a stage hidden if any of the sections we're in
      # hide it
      sections.any? {|s| script_level.hidden_for_section?(s.id)}
    end
  end

  # Is the given script hidden for this user (based on the sections that they are in)
  def script_hidden?(script)
    return false if try(:teacher?)

    return false if sections_as_student.empty?

    # Can't hide a script that isn't part of a course
    course = script.try(:course)
    return false unless course

    get_student_hidden_ids(course.id, false).include?(script.id)
  end

  # @return {Hash<string,number[]>|number[]}
  #   For teachers, this will be a hash mapping from section id to a list of hidden
  #   stage ids for that section.
  #   For students this will just be a list of stage ids that are hidden for them.
  def get_hidden_stage_ids(script_name)
    script = Script.get_from_cache(script_name)
    return [] if script.nil?

    teacher? ? get_teacher_hidden_ids(true) : get_student_hidden_ids(script.id, true)
  end

  # @return {Hash<string,number[]>|number[]}
  #   For teachers, this will be a hash mapping from section id to a list of hidden
  #   script ids for that section.
  #   For students this will just be a list of script ids that are hidden for them.
  def get_hidden_script_ids(course = nil)
    return [] if !teacher? && course.nil?

    teacher? ? get_teacher_hidden_ids(false) : get_student_hidden_ids(course.id, false)
  end

  def student?
    user_type == TYPE_STUDENT
  end

  def teacher?
    user_type == TYPE_TEACHER
  end

  def authorized_teacher?
    # You are an authorized teacher if you are an admin, have the AUTHORIZED_TEACHER or the
    # LEVELBUILDER permission.
    return true if admin?
    if permission?(UserPermission::AUTHORIZED_TEACHER) || permission?(UserPermission::LEVELBUILDER)
      return true
    end
    false
  end

  alias :verified_teacher? :authorized_teacher?

  def student_of_authorized_teacher?
    teachers.any?(&:authorized_teacher?)
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

  # There are some shenanigans going on with this age stuff. The
  # actual persisted column is birthday -- so we convert age to a
  # birthday when writing and convert birthday to an age when
  # reading. However -- when we are generating error messages for the
  # user on an unsaved record, we actually 'read' and 'write' the
  # attribute via these accessors. @age is a non-persisted member that
  # we use to save the (possibly invalid) value that the user entered
  # for age so we can generate the correct error message.

  def age=(val)
    @age = val
    val = val.to_i rescue 0 # sometimes we get age: {"Pr" => nil}
    return unless val > 0
    return unless val < 200
    return if birthday && val == age # don't change birthday if we want to stay the same age

    self.birthday = val.years.ago
  end

  def age
    return @age unless birthday
    age = UserHelpers.age_from_birthday(birthday)
    if age < 4
      age = nil
    elsif age >= 21
      age = '21+'
    end
    age
  end

  # Duplicated by under_13? in auth_helpers.rb, which doesn't use the rails model.
  def under_13?
    age.nil? || age.to_i < 13
  end

  def generate_username
    # skip an expensive db query if the name is not valid anyway. we can't depend on validations being run
    return if name.blank? || name.utf8mb4? || (email && email.utf8mb4?)
    self.username = UserHelpers.generate_username(User.with_deleted, name)
  end

  def short_name
    return username if name.blank?

    name.split.first # 'first name'
  end

  def initial
    UserHelpers.initial(name)
  end

  def valid_secret_words?(words)
    words == secret_words
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

  # Override how devise tries to find users by email to reset password
  # to also look for the hashed email. For users who have their email
  # stored hashed (and not in plaintext), we can still allow them to
  # reset their password with their email (by looking up the hash)

  attr_accessor :raw_token
  def self.send_reset_password_instructions(attributes={})
    # override of Devise method
    if attributes[:email].blank?
      user = User.new
      user.errors.add :email, I18n.t('activerecord.errors.messages.blank')
      return user
    end

    email = attributes[:email]
    associated_users = User.associated_users(email)
    return User.new(email: email).send_reset_password_for_users(email, associated_users)
  end

  attr_accessor :child_users
  def send_reset_password_for_users(email, users)
    if users.empty?
      not_found_user = User.new(email: email)
      not_found_user.errors.add :email, :not_found
      return not_found_user
    end

    unique_users = users.uniq

    # Normal case: single user, owner of the email attached to this account
    if unique_users.length == 1 && (unique_users.first.email == email || unique_users.first.hashed_email == User.hash_email(email))
      primary_user = unique_users.first
      primary_user.raw_token = primary_user.send_reset_password_instructions(email) # protected in the superclass
      return primary_user
    end

    # One or more users are associated with parent email, generate reset tokens for each one
    unique_users.each do |user|
      raw, enc = Devise.token_generator.generate(User, :reset_password_token)
      user.raw_token = raw
      user.reset_password_token   = enc
      user.reset_password_sent_at = Time.now.utc
      user.save(validate: false)
    end

    begin
      # Send the password reset to the parent
      raw, _enc = Devise.token_generator.generate(User, :reset_password_token)
      self.child_users = unique_users
      send_devise_notification(:reset_password_instructions, raw, {to: email})
    rescue ArgumentError
      errors.add :base, I18n.t('password.reset_errors.invalid_email')
      return nil
    end
  end

  # Send a password reset email to the user (not to their parent)
  def send_reset_password_instructions(email)
    raw, enc = Devise.token_generator.generate(self.class, :reset_password_token)

    self.reset_password_token   = enc
    self.reset_password_sent_at = Time.now.utc
    save(validate: false)

    send_devise_notification(:reset_password_instructions, raw, {to: email})
    raw
  rescue ArgumentError
    errors.add :base, I18n.t('password.reset_errors.invalid_email')
    return nil
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

  # Returns an array of experiment name strings
  def get_active_experiment_names
    Experiment.get_all_enabled(user: self).pluck(:name)
  end

  def advertised_scripts
    [
      Script.hoc_2014_script, Script.frozen_script, Script.infinity_script,
      Script.flappy_script, Script.playlab_script, Script.artist_script,
      Script.course1_script, Script.course2_script, Script.course3_script,
      Script.course4_script, Script.twenty_hour_script, Script.starwars_script,
      Script.starwars_blocks_script, Script.minecraft_script
    ]
  end

  def in_progress_and_completed_scripts
    user_scripts.compact.reject do |user_script|
      user_script.script.nil?
    rescue
      # Getting user_script.script can raise if the script does not exist
      # In that case we should also reject this user_script.
      true
    end
  end

  # Returns an array of hashes storing data for each unique course assigned to # sections that this user is a part of.
  # @return [Array{CourseData}]
  def assigned_courses
    section_courses.map(&:summarize_short)
  end

  def assigned_course?(course)
    section_courses.include?(course)
  end

  def assigned_script?(script)
    section_scripts.include?(script) || section_courses.include?(script&.course)
  end

  # Returns the set of courses the user has been assigned to or has progress in.
  def courses_as_student
    scripts.map(&:course).compact.concat(section_courses).uniq
  end

  # Checks if there are any non-hidden scripts assigned to the user.
  # @return [Array] of Scripts
  def visible_assigned_scripts
    user_scripts.where("assigned_at").
      map {|user_script| Script.where(id: user_script.script.id, hidden: 'false')}.
      flatten
  end

  # Checks if there are any non-hidden scripts assigned to the user.
  # @return [Boolean]
  def any_visible_assigned_scripts?
    visible_assigned_scripts.any?
  end

  def most_recently_assigned_user_script
    user_scripts.
    where("assigned_at").
    order(assigned_at: :desc).
    first
  end

  def most_recently_assigned_script
    most_recently_assigned_user_script.script
  end

  def can_access_most_recently_assigned_script?
    return false unless script = most_recently_assigned_user_script&.script

    !script.pilot? || script.has_pilot_access?(self)
  end

  def user_script_with_most_recent_progress
    user_scripts.
    where("last_progress_at").
    order(last_progress_at: :desc).
    first
  end

  def script_with_most_recent_progress
    user_script_with_most_recent_progress.script
  end

  def most_recent_progress_in_recently_assigned_script?
    script_with_most_recent_progress == most_recently_assigned_script
  end

  def last_assignment_after_most_recent_progress?
    most_recently_assigned_user_script[:assigned_at] >=
    user_script_with_most_recent_progress[:last_progress_at]
  end

  # Checks if there are any non-hidden scripts or courses assigned to the user.
  # @return [Boolean]
  def assigned_course_or_script?
    assigned_courses.any? || any_visible_assigned_scripts?
  end

  # Return a collection of courses and scripts for the user.
  # First in the list will be courses enrolled in by the user's sections.
  # Following that will be all scripts in which the user has made progress that # are not in any of the enrolled courses.
  # @param exclude_primary_script [boolean]
  # Example: true when the primary_script is being used for a TopCourse on /home
  # @return [Array{CourseData, ScriptData}] an array of hashes of script and
  # course data
  def recent_courses_and_scripts(exclude_primary_script)
    primary_script_id = primary_script.try(:id)

    # Filter out user_scripts that are already covered by a course
    course_scripts_script_ids = courses_as_student.map(&:default_course_scripts).flatten.pluck(:script_id).uniq

    user_scripts = in_progress_and_completed_scripts.
      select {|user_script| !course_scripts_script_ids.include?(user_script.script_id)}

    user_script_data = user_scripts.map do |user_script|
      # Skip this script if we are excluding the primary script and this is the
      # primary script.
      if exclude_primary_script && user_script[:script_id] == primary_script_id
        nil
      else
        script_id = user_script[:script_id]
        script = Script.get_from_cache(script_id)
        {
          name: script[:name],
          title: data_t_suffix('script.name', script[:name], 'title'),
          description: data_t_suffix('script.name', script[:name], 'description_short', default: ''),
          link: script_path(script),
        }
      end
    end.compact

    user_course_data = courses_as_student.map(&:summarize_short)

    user_course_data + user_script_data
  end

  # Figures out the unique set of courses assigned to sections that this user
  # is a part of.
  # @return [Array<Course>]
  def section_courses
    all_sections = sections.to_a.concat(sections_as_student).uniq

    # In the future we may want to make it so that if assigned a script, but that
    # script has a default course, it shows up as a course here
    all_sections.map(&:course).compact.uniq
  end

  # Figures out the unique set of scripts assigned to sections that this user
  # is a part of. Includes default scripts for any assigned courses as well.
  # @return [Array<Script>]
  def section_scripts
    all_sections = sections.to_a.concat(sections_as_student).uniq
    all_scripts = []
    all_sections.each do |section|
      if section.script.present?
        all_scripts << section.script
      elsif section.course.present?
        all_scripts.concat(section.course.default_scripts)
      end
    end

    all_scripts
  end

  # return the id of the section the user most recently created.
  def last_section_id
    teacher? ? sections.where(hidden: false).last&.id : nil
  end

  # The section which the user most recently joined as a student, or nil if none exists.
  # @return [Section|nil]
  def last_joined_section
    Follower.where(student_user: self).order(created_at: :desc).first.try(:section)
  end

  def all_advertised_scripts_completed?
    advertised_scripts.all? {|script| completed?(script)}
  end

  def completed?(script)
    user_script = user_scripts.where(script_id: script.id).first
    return false unless user_script
    !!user_script.completed_at || completed_progression_levels?(script)
  end

  def not_started?(script)
    !completed?(script) && !a_level_passed?(script)
  end

  def a_level_passed?(script)
    user_levels_by_level = user_levels_by_level(script)
    script.script_levels.detect do |script_level|
      user_level = user_levels_by_level[script_level.level_id]
      is_passed = (user_level && user_level.passing?)
      script_level.valid_progression_level? && is_passed
    end
  end

  def working_on?(script)
    working_on_scripts.include?(script)
  end

  def working_on_scripts
    scripts.where('user_scripts.completed_at is null').map(&:cached)
  end

  # NOTE: Changes to this method should be mirrored in
  # in_progress_and_completed_scripts.
  def working_on_user_scripts
    user_scripts.where('user_scripts.completed_at is null')
  end

  # NOTE: Changes to this method should be mirrored in
  # in_progress_and_completed_scripts.
  def completed_user_scripts
    user_scripts.where('user_scripts.completed_at is not null')
  end

  def primary_script
    working_on_scripts.first.try(:cached)
  end

  # Returns integer days since account creation, rounded down
  def account_age_days
    (DateTime.now - created_at.to_datetime).to_i
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

  # Increases the level counts for the concept-difficulties associated with the
  # completed level.
  def self.track_proficiency(user_id, script_id, level_id)
    level_concept_difficulty = Script.cache_find_level(level_id).level_concept_difficulty
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

  # The synchronous handler for the track_level_progress helper.
  # @return [UserLevel]
  def self.track_level_progress(user_id:, level_id:, script_id:, new_result:, submitted:, level_source_id:, pairing_user_ids: nil, is_navigator: false)
    new_level_completed = false
    new_csf_level_perfected = false

    user_level = nil
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      user_level = UserLevel.
        where(user_id: user_id, level_id: level_id, script_id: script_id).
        first_or_initialize

      if !user_level.passing? && ActivityConstants.passing?(new_result)
        new_level_completed = true
      end

      script = Script.get_from_cache(script_id)
      script_valid = script.csf? && script.name != Script::COURSE1_NAME
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
      if level_source_id && !is_navigator
        user_level.level_source_id = level_source_id
      end

      user_level.atomic_save!
    end

    if pairing_user_ids
      pairing_user_ids.each do |navigator_user_id|
        navigator_user_level, _ = User.track_level_progress(
          user_id: navigator_user_id,
          level_id: level_id,
          script_id: script_id,
          new_result: new_result,
          submitted: submitted,
          level_source_id: level_source_id,
          pairing_user_ids: nil,
          is_navigator: true
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

  # This method is called when a section the user belongs to is assigned to
  # a script. We find or create a new UserScript entry, and set assigned_at
  # if not already set.
  # @param script [Script] The script to assign.
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

  def self.csv_attributes
    # same as in UserSerializer
    [:id, :email, :ops_first_name, :ops_last_name, :district_name, :ops_school, :ops_gender, :races]
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
      email: email,
      hashed_email: hashed_email,
      user_type: user_type,
      gender: gender,
      birthday: birthday,
      total_lines: total_lines,
      secret_words: secret_words,
      secret_picture_name: secret_picture&.name,
      secret_picture_path: secret_picture&.path,
      location: "/v2/users/#{id}",
      age: age,
      sharing_disabled: sharing_disabled?,
      has_ever_signed_in: has_ever_signed_in?,
    }
  end

  def has_ever_signed_in?
    current_sign_in_at.present?
  end

  def migrated?
    provider == PROVIDER_MIGRATED
  end

  def manual?
    provider == PROVIDER_MANUAL
  end

  def sponsored?
    if migrated?
      authentication_options.empty? && encrypted_password.blank?
    else
      provider == PROVIDER_SPONSORED
    end
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
      can_edit_email? && sections_as_student.empty?
    else # downgrading to student
      # Teachers with sections cannot downgrade because our validations require sections
      # to be owned by teachers.
      sections.empty?
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
  # sections they are in as a student, otherwise sections they are the owner of
  def section_for_script(script)
    sections_as_student.find {|section| section.script_id == script.id} ||
      sections.find {|section| section.script_id == script.id}
  end

  def stage_extras_enabled?(script)
    return false unless script.stage_extras_available?
    return true if teacher?

    sections_as_student.any? do |section|
      section.script_id == script.id && section.stage_extras
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

  # Returns whether the user has accepted the latest major version of the Terms of Service
  def accepted_latest_terms?
    terms_of_service_version == TERMS_OF_SERVICE_VERSIONS.last
  end

  # Returns the latest major version of the Terms of Service
  def latest_terms_version
    TERMS_OF_SERVICE_VERSIONS.last
  end

  def should_see_inline_answer?(script_level)
    return true if Rails.application.config.levelbuilder_mode

    script = script_level.try(:script)

    (authorized_teacher? && script && !script.professional_learning_course?) ||
      (script_level && UserLevel.find_by(user: self, level: script_level.level).try(:readonly_answers))
  end

  def show_census_teacher_banner?
    # Must have an NCES school to show the banner
    users_school = try(:school_info).try(:school)
    teacher? && users_school && (next_census_display.nil? || Date.today >= next_census_display.to_date)
  end

  def show_race_interstitial?(ip = nil)
    ip_to_check = ip || current_sign_in_ip
    RaceInterstitialHelper.show_race_interstitial?(self, ip_to_check)
  end

  def show_school_info_confirmation_dialog?
    SchoolInfoInterstitialHelper.show_school_info_confirmation_dialog?(self)
  end

  def show_school_info_interstitial?
    SchoolInfoInterstitialHelper.show_school_info_interstitial?(self)
  end

  # Removes PII and other information from the user and marks the user as having been purged.
  # WARNING: This (permanently) destroys data and cannot be undone.
  # WARNING: This does not purge the user, only marks them as such.
  def clear_user_and_mark_purged
    random_suffix = (('0'..'9').to_a + ('a'..'z').to_a).sample(8).join

    authentication_options.with_deleted.each(&:really_destroy!)
    self.primary_contact_info = nil

    self.studio_person_id = nil
    self.name = nil
    self.username = "#{SYSTEM_DELETED_USERNAME}_#{random_suffix}"
    self.current_sign_in_ip = nil
    self.last_sign_in_ip = nil
    self.email = ''
    self.hashed_email = ''
    self.parent_email = nil
    self.encrypted_password = nil
    self.uid = nil
    self.reset_password_token = nil
    self.full_address = nil
    self.secret_picture_id = nil
    self.secret_words = nil
    self.school = nil
    self.school_info_id = nil
    self.properties = {}
    unless within_united_states?
      self.urm = nil
      self.races = nil
    end

    self.purged_at = Time.zone.now

    save!
  end

  def within_united_states?
    'United States' == user_geos.first&.country
  end

  def associate_with_potential_pd_enrollments
    if teacher?
      Pd::Enrollment.where(email: email, user: nil).each do |enrollment|
        enrollment.update(user: self)
      end
    end
  end

  # Disable sharing of advanced projects for students under 13 upon
  # account creation
  def update_default_share_setting
    self.sharing_disabled = true if under_13?
  end

  # If a user is now over age 13, we should update
  # their share setting to enabled, if they are in no sections.
  def update_share_setting
    self.sharing_disabled = false if sections_as_student.empty?
    return true
  end

  # When creating an account, we want to look for any channels that got created
  # for this user before they signed in, and if any of them are in our Applab HOC
  # course, we will create a UserScript entry so that they get a course card
  # In addition, we want to have green bubbles for the levels associated with these
  # channels, so we create level progress.
  def generate_progress_from_storage_id(storage_id, script_name='applab-intro')
    # applab-intro is not seeded in our minimal test env used on test/circle. We
    # should be able to handle this gracefully
    script = begin
      Script.get_from_cache(script_name)
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
      User.track_script_progress(id, Script.get_from_cache(script_name).id)

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

  after_destroy :record_soft_delete
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

  # Called before_destroy.
  # Soft-deletes any projects and other channel-backed progress belonging to
  # this user.  Unfeatures any featured projects belonging to this user.
  private def soft_delete_channels
    return unless user_storage_id

    channel_ids = PEGASUS_DB[:storage_apps].
      where(storage_id: user_storage_id).
      map(:id)

    # Unfeature any featured projects owned by the user
    FeaturedProject.
      where(storage_app_id: channel_ids, unfeatured_at: nil).
      where.not(featured_at: nil).
      update_all(unfeatured_at: Time.now)

    # Soft-delete all of the user's channels
    PEGASUS_DB[:storage_apps].
      where(id: channel_ids).
      exclude(state: 'deleted').
      update(state: 'deleted', updated_at: Time.now)
  end

  # Restores all of this user's projects that were soft-deleted after the given time
  # Called after undestroy
  private def restore_channels_deleted_after(deleted_at)
    return unless user_storage_id

    channel_ids = PEGASUS_DB[:storage_apps].
      where(storage_id: user_storage_id).
      map(:id)

    PEGASUS_DB[:storage_apps].
      where(id: channel_ids, state: 'deleted').
      where(Sequel.lit('updated_at >= ?', deleted_at.localtime)).
      update(state: 'active', updated_at: Time.now)
  end

  # Gets the user's user_storage_id from the pegasus database, if it's available.
  # Note: Known that this duplicates some logic in storage_id_for_user_id, but
  # that method is globally stubbed in tests :cry: and therefore not very helpful.
  def user_storage_id
    @user_storage_id ||= PEGASUS_DB[:user_storage_ids].where(user_id: id).first&.[](:id)
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
    restore_channels_deleted_after(soft_delete_time - 5.minutes)
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

  private

  def hidden_stage_ids(sections)
    return sections.flat_map(&:section_hidden_stages).pluck(:stage_id)
  end

  def hidden_script_ids(sections)
    return sections.flat_map(&:section_hidden_scripts).pluck(:script_id)
  end

  # This method will extract a list of hidden ids by section. The type of ids depends
  # on the input. If hidden_stages is true, id is expected to be a script id and
  # we look for stages that are hidden. If hidden_stages is false, id is expected
  # to be a course_id, and we look for hidden scripts.
  # @param {boolean} hidden_stages - True if we're looking for hidden stages, false
  #   if we're looking for hidden scripts.
  # @return {Hash<string,number[]>
  def get_teacher_hidden_ids(hidden_stages)
    # If we're a teacher, we want to go through each of our sections and return
    # a mapping from section id to hidden stages/scripts in that section
    hidden_by_section = {}
    sections.each do |section|
      hidden_by_section[section.id] = hidden_stages ? hidden_stage_ids([section]) : hidden_script_ids([section])
    end
    hidden_by_section
  end

  # This method method will go through each of the sections in which we're a member
  # and determine which stages/scripts should be hidden
  # @param {boolean} hidden_stages - True if we're looking for hidden stages, false
  #   if we're looking for hidden scripts.
  # @return {number[]} Set of stage/script ids that should be hidden
  def get_student_hidden_ids(assign_id, hidden_stages)
    sections = sections_as_student
    return [] if sections.empty?

    sections = sections.reject(&:hidden)
    assigned_sections = sections.select do |section|
      hidden_stages ? section.script_id == assign_id : section.course_id == assign_id
    end

    if assigned_sections.empty?
      # if we have no sections matching this assignment, we consider a stage/script
      # hidden if any of our sections hides it
      return (hidden_stages ? hidden_stage_ids(sections) : hidden_script_ids(sections)).uniq
    else
      # if we do have sections matching this assignment, we consider a stage/script
      # hidden only if it is hidden in every one of the sections the student belongs
      # to that match this assignment
      all_ids = hidden_stages ? hidden_stage_ids(assigned_sections) : hidden_script_ids(assigned_sections)

      counts = all_ids.each_with_object(Hash.new(0)) {|id, hash| hash[id] += 1}
      return counts.select {|_, val| val == assigned_sections.length}.keys
    end
  end

  def normalize_parent_email
    self.parent_email = nil if parent_email.blank?
  end

  # Parent email is not required, but if it is present, it must be a
  # well-formed email address.
  def validate_parent_email
    errors.add(:parent_email) unless parent_email.nil? ||
      Cdo::EmailValidator.email_address?(parent_email)
  end
end

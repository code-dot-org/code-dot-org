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
#  primary_email_id         :integer
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
require 'cdo/user_helpers'
require 'cdo/race_interstitial_helper'
require 'cdo/chat_client'
require 'cdo/shared_cache'
require 'school_info_interstitial_helper'

class User < ActiveRecord::Base
  include SerializedProperties
  include SchoolInfoDeduplicator
  include LocaleHelper
  include Rails.application.routes.url_helpers
  # races: array of strings, the races that a student has selected.
  # Allowed values for race are:
  #   white: "White"
  #   black: "Black or African American"
  #   hispanic: "Hispanic or Latino"
  #   asian: "Asian"
  #   hawaiian: "Native Hawaiian or other Pacific Islander"
  #   american_indian: "American Indian/Alaska Native"
  #   other: "Other"
  #   opt_out: "Prefer not to say" (but selected this value and hit "Submit")
  #   closed_dialog: This is a special value indicating that the user closed the
  #     dialog rather than selecting a race.
  #   nonsense: This is a special value indicating that the user chose
  #     (strictly) more than five races.
  VALID_RACES = %w(
    white
    black
    hispanic
    asian
    hawaiian
    american_indian
    other
    opt_out
    closed_dialog
    nonsense
  ).freeze
  serialized_attrs %w(
    ops_first_name
    ops_last_name
    district_id
    ops_school
    ops_gender
    using_text_mode
    last_seen_school_info_interstitial
    ui_tip_dismissed_homepage_header
    ui_tip_dismissed_teacher_courses
    oauth_refresh_token
    oauth_token
    oauth_token_expiration
    sharing_disabled
    next_census_display
  )

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable
  devise :invitable, :database_authenticatable, :registerable, :omniauthable,
    :recoverable, :rememberable, :trackable

  acts_as_paranoid # use deleted_at column instead of deleting rows

  PROVIDER_MANUAL = 'manual'.freeze # "old" user created by a teacher -- logs in w/ username + password
  PROVIDER_SPONSORED = 'sponsored'.freeze # "new" user created by a teacher -- logs in w/ name + secret picture/word

  OAUTH_PROVIDERS = %w(
    clever
    facebook
    google_oauth2
    lti_lti_prod_kids.qwikcamps.com
    the_school_project
    twitter
    windowslive
  ).freeze

  SYSTEM_DELETED_USERNAME = 'sys_deleted'

  # :user_type is locked. Use the :permissions property for more granular user permissions.
  USER_TYPE_OPTIONS = [
    TYPE_STUDENT = 'student'.freeze,
    TYPE_TEACHER = 'teacher'.freeze
  ].freeze
  validates_inclusion_of :user_type, in: USER_TYPE_OPTIONS

  belongs_to :studio_person
  has_many :permissions, class_name: 'UserPermission', dependent: :destroy
  has_many :hint_view_requests

  # Teachers can be in multiple cohorts
  has_and_belongs_to_many :cohorts

  # workshops that I am attending
  has_many :workshops, through: :cohorts
  has_many :segments, through: :workshops

  # courses a facilitator is able to teach
  has_many :courses_as_facilitator,
    class_name: Pd::CourseFacilitator,
    foreign_key: :facilitator_id,
    dependent: :destroy

  has_and_belongs_to_many :workshops_as_facilitator,
    class_name: Workshop,
    foreign_key: :facilitator_id,
    join_table: :facilitators_workshops

  # you can be associated with a district if you are the district contact
  has_one :district_as_contact,
    class_name: 'District',
    foreign_key: 'contact_id'

  has_many :regional_partner_program_managers,
    foreign_key: :program_manager_id
  has_many :regional_partners,
    through: :regional_partner_program_managers

  has_many :pd_workshops_organized, class_name: 'Pd::Workshop', foreign_key: :organizer_id

  has_many :districts_users, class_name: 'DistrictsUsers'
  has_many :districts, through: :districts_users

  has_many :authentication_options, dependent: :destroy
  belongs_to :primary_email, class_name: 'AuthenticationOption', foreign_key: :primary_email_id

  belongs_to :school_info
  accepts_nested_attributes_for :school_info, reject_if: :preprocess_school_info
  validates_presence_of :school_info, unless: :school_info_optional?

  has_one :circuit_playground_discount_application

  has_many :pd_applications,
    class_name: 'Pd::Application::ApplicationBase',
    dependent: :destroy

  after_create :associate_with_potential_pd_enrollments

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

  # Not deployed to everyone, so we don't require this for anybody, yet
  def school_info_optional?
    true # update if/when A/B test is done and accepted
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
    unless provider && provider == 'migrated'
      return self[:email]
    end
    if primary_email.nil?
      nil
    else
      primary_email.email
    end
  end

  def hashed_email
    unless provider && provider == 'migrated'
      return self[:hashed_email]
    end
    if primary_email.nil?
      nil
    else
      primary_email.hashed_email
    end
  end

  def facilitator?
    permission? UserPermission::FACILITATOR
  end

  def workshop_organizer?
    permission? UserPermission::WORKSHOP_ORGANIZER
  end

  def program_manager?
    permission? UserPermission::PROGRAM_MANAGER
  end

  def workshop_admin?
    permission? UserPermission::WORKSHOP_ADMIN
  end

  def project_validator?
    permission? UserPermission::PROJECT_VALIDATOR
  end

  # assign a course to a facilitator that is qualified to teach it
  def course_as_facilitator=(course)
    courses_as_facilitator << courses_as_facilitator.find_or_create_by(facilitator_id: id, course: course)
  end

  def delete_course_as_facilitator(course)
    courses_as_facilitator.find_by(course: course).try(:destroy)
  end

  # admin can be nil, which should be treated as false
  def admin_changed?
    # no change: false
    # false <-> nil: false
    # false|nil <-> true: true
    !!changes['admin'].try {|from, to| !!from != !!to}
  end

  def log_admin_save
    ChatClient.message 'infra-security',
      "#{admin ? 'Granting' : 'Revoking'} UserPermission: "\
      "environment: #{rack_env}, "\
      "user ID: #{id}, "\
      "email: #{email}, "\
      "permission: ADMIN",
      color: 'yellow'
  end

  # don't log changes to admin permission in development, test, and ad_hoc environments
  def self.should_log?
    return [:staging, :levelbuilder, :production].include? rack_env
  end

  def delete_permission(permission)
    @permissions = nil
    permission = permissions.find_by(permission: permission)
    permissions.delete permission if permission
  end

  def permission=(permission)
    @permissions = nil
    permissions << permissions.find_or_create_by(user_id: id, permission: permission)
  end

  # @param permission [UserPermission] the permission to query.
  # @return [Boolean] whether the User has permission granted.
  # TODO(asher): Determine whether request level caching is sufficient, or
  #   whether a memcache or otherwise should be employed.
  def permission?(permission)
    return false unless teacher?
    if @permissions.nil?
      # The user's permissions have not yet been cached, so do the DB query,
      # caching the results.
      @permissions = UserPermission.where(user_id: id).pluck(:permission)
    end
    # Return the cached results.
    return @permissions.include? permission
  end

  # Revokes all escalated permissions associated with the user, including admin status and any
  # granted UserPermission's.
  def revoke_all_permissions
    update_column(:admin, nil)
    UserPermission.where(user_id: id).each(&:destroy)
  end

  def district_contact?
    return false unless teacher?
    district_as_contact.present?
  end

  def district
    District.find(district_id) if district_id
  end

  def district_name
    district.try(:name)
  end

  # Given a user_id, username, or email, attempts to find the relevant user
  def self.from_identifier(identifier)
    (identifier.to_i.to_s == identifier && where(id: identifier).first) ||
      where(username: identifier).first ||
      find_by_email_or_hashed_email(identifier)
  end

  def self.find_or_create_teacher(params, invited_by_user, permission = nil)
    user = User.find_by_email_or_hashed_email(params[:email])
    unless user
      # initialize new users with name and school
      if params[:ops_first_name] || params[:ops_last_name]
        params[:name] ||= [params[:ops_first_name], params[:ops_last_name]].flatten.join(" ")
      end
      params[:school] ||= params[:ops_school]

      # Devise Invitable's invite! skips validation, so we must first validate the email ourselves.
      # See https://github.com/scambra/devise_invitable/blob/5eb76d259a954927308bfdbab363a473c520748d/lib/devise_invitable/model.rb#L151
      ValidatesEmailFormatOf.validate_email_format(params[:email]).tap do |result|
        raise ArgumentError, "'#{params[:email]}' #{result.first}" unless result.nil?
      end
      user = User.invite!(
        email: params[:email],
        user_type: TYPE_TEACHER,
        age: 21
      )
      user.invited_by = invited_by_user
    end

    user.update!(params.merge(user_type: TYPE_TEACHER))

    if permission
      user.permission = permission
      user.save!
    end
    user
  end

  def self.find_or_create_district_contact(params, invited_by_user)
    find_or_create_teacher(params, invited_by_user, UserPermission::DISTRICT_CONTACT)
  end

  def self.find_or_create_facilitator(params, invited_by_user)
    find_or_create_teacher(params, invited_by_user, UserPermission::FACILITATOR)
  end

  # a district contact can see the teachers from their district that are part of a cohort
  def district_teachers(cohort = nil)
    return nil unless district_contact?
    teachers = district.users
    (cohort ? teachers.joins(:cohorts).where(cohorts: {id: cohort}) : teachers).to_a
  end

  GENDER_OPTIONS = [
    [nil, ''],
    ['gender.male', 'm'],
    ['gender.female', 'f'],
    ['gender.none', '-']
  ].freeze

  attr_accessor :login

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

  before_create :suppress_ui_tips_for_new_users

  # a bit of trickery to sort most recently started/assigned/progressed scripts first and then completed
  has_many :user_scripts, -> {order "-completed_at asc, greatest(coalesce(started_at, 0), coalesce(assigned_at, 0), coalesce(last_progress_at, 0)) desc, user_scripts.id asc"}
  has_many :scripts, -> {where hidden: false}, through: :user_scripts, source: :script

  validates :name, presence: true, unless: -> {purged_at}
  validates :name, length: {within: 1..70}, allow_blank: true
  validates :name, no_utf8mb4: true

  defer_age = proc {|user| user.provider == 'google_oauth2' || user.provider == 'clever' || user.provider == User::PROVIDER_SPONSORED}
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

  before_save :log_admin_save, if: -> {admin_changed? && User.should_log?}

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

  # @return [Boolean, nil] Whether the the list of races stored in the `races` column represents an
  # under-represented minority.
  #   - true: Yes, a URM user.
  #   - false: No, not a URM user.
  #   - nil: Don't know, may or may not be a URM user.
  def urm_from_races
    return nil unless races

    races_as_list = races.split ','
    return nil if races_as_list.empty?
    return nil if (races_as_list & ['opt_out', 'nonsense', 'closed_dialog']).any?
    return true if (races_as_list & ['black', 'hispanic', 'hawaiian', 'american_indian']).any?
    false
  end

  def sanitize_race_data_set_urm
    return true unless races_changed?

    if races
      races_as_list = races.split ','
      if races_as_list.include? 'closed_dialog'
        self.races = 'closed_dialog'
      elsif races_as_list.length > 5
        self.races = 'nonsense'
      else
        races_as_list.each do |race|
          self.races = 'nonsense' unless VALID_RACES.include? race
        end
      end
    end

    self.urm = urm_from_races

    true
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
    if teacher?
      self.studio_person = StudioPerson.create!(emails: email) unless studio_person
      if user_type_changed? && !terms_of_service_version_changed?
        self.terms_of_service_version = nil
      end
    end
  end

  def self.find_by_email_or_hashed_email(email)
    return nil if email.blank?

    hashed_email = User.hash_email(email)
    User.find_by(hashed_email: hashed_email)
  end

  def self.find_channel_owner(encrypted_channel_id)
    owner_storage_id, _ = storage_decrypt_channel_id(encrypted_channel_id)
    user_id = PEGASUS_DB[:user_storage_ids].first(id: owner_storage_id)[:user_id]
    User.find(user_id)
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

  def self.normalize_gender(v)
    return nil if v.blank?
    case v.downcase
    when 'f', 'female'
      'f'
    when 'm', 'male'
      'm'
    else
      nil
    end
  end

  def self.name_from_omniauth(raw_name)
    return raw_name if raw_name.blank? || raw_name.is_a?(String) # some services just give us a string
    # clever returns a hash instead of a string for name
    "#{raw_name['first']} #{raw_name['last']}".squish
  end

  CLEVER_ADMIN_USER_TYPES = ['district_admin', 'school_admin'].freeze
  def self.from_omniauth(auth, params)
    omniauth_user = find_or_create_by(provider: auth.provider, uid: auth.uid) do |user|
      user.provider = auth.provider
      user.uid = auth.uid
      user.name = name_from_omniauth auth.info.name
      user.user_type = params['user_type'] || auth.info.user_type
      # Store emails, except when using Clever
      user.email = auth.info.email unless user.user_type == 'student' && auth.provider == 'clever'

      if auth.provider == 'clever' && User.find_by_email_or_hashed_email(user.email)
        user.email = user.email + '.cleveremailalreadytaken'
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
      user.gender = normalize_gender auth.info.gender
    end

    if auth.credentials
      if auth.credentials.refresh_token
        omniauth_user.oauth_refresh_token = auth.credentials.refresh_token
      end

      omniauth_user.oauth_token = auth.credentials.token
      omniauth_user.oauth_token_expiration = auth.credentials.expires_at

      omniauth_user.save if omniauth_user.changed?
    end

    omniauth_user
  end

  def oauth?
    OAUTH_PROVIDERS.include? provider
  end

  def self.new_with_session(params, session)
    if session["devise.user_attributes"]
      new(session["devise.user_attributes"]) do |user|
        user.attributes = params
        cache = CDO.shared_cache
        OmniauthCallbacksController::OAUTH_PARAMS_TO_STRIP.each do |param|
          next if user.send(param)
          # Grab the oauth token from memcached if it's there
          oauth_cache_key = OmniauthCallbacksController.get_cache_key(param, user)
          user.send("#{param}=", cache.read(oauth_cache_key)) if cache
        end
        user.valid?
      end
    else
      super
    end
  end

  def password_required?
    # password is required if:
    (!persisted? || # you are a new user
     !password.nil? || !password_confirmation.nil?) && # or changing your password
      (provider.blank? || (User::PROVIDER_MANUAL == provider)) # and you are a person creating your own account
    # (as opposed to a person who had their account created for them or are logging in with oauth)
  end

  def email_required?
    return true if teacher?
    return false if provider == User::PROVIDER_MANUAL
    return false if provider == User::PROVIDER_SPONSORED
    return false if oauth?
    return false if parent_managed_account?
    true
  end

  def username_required?
    provider == User::PROVIDER_MANUAL || username_changed?
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

  # overrides Devise::Authenticatable#find_first_by_auth_conditions
  # see https://github.com/plataformatec/devise/blob/master/lib/devise/models/authenticatable.rb#L245
  def self.find_for_authentication(tainted_conditions)
    conditions = devise_parameter_filter.filter(tainted_conditions.dup)
    # we get either a login (username) or hashed_email
    login = conditions.delete(:login)
    if login.present?
      return nil if login.utf8mb4?
      from("users IGNORE INDEX(index_users_on_deleted_at)").where(
        [
          'username = :value OR email = :value OR hashed_email = :hashed_value',
          {value: login.downcase, hashed_value: hash_email(login.downcase)}
        ]
      ).first
    elsif hashed_email = conditions.delete(:hashed_email)
      return nil if hashed_email.utf8mb4?
      where(hashed_email: hashed_email).first
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
  def get_hidden_script_ids(course)
    return [] if course.nil?

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
    # LEVELBUILDER permission, or are a teacher in a cohort.
    return true if admin?
    if permission?(UserPermission::AUTHORIZED_TEACHER) || permission?(UserPermission::LEVELBUILDER)
      return true
    end
    if teacher? && cohorts.present?
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

    # Normal case: single user, owner of the email attached to this account
    if users.length == 1 && (users.first.email == email || users.first.hashed_email == User.hash_email(email))
      primary_user = users.first
      primary_user.raw_token = primary_user.send_reset_password_instructions(email) # protected in the superclass
      return primary_user
    end

    # One or more users are associated with parent email, generate reset tokens for each one
    users.each do |user|
      raw, enc = Devise.token_generator.generate(User, :reset_password_token)
      user.raw_token = raw
      user.reset_password_token   = enc
      user.reset_password_sent_at = Time.now.utc
      user.save(validate: false)
    end

    begin
      # Send the password reset to the parent
      raw, _enc = Devise.token_generator.generate(User, :reset_password_token)
      self.child_users = users
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

  def generate_secret_picture
    self.secret_picture = SecretPicture.random
  end

  def generate_secret_words
    self.secret_words = [SecretWord.random.word, SecretWord.random.word].join(" ")
  end

  def suppress_ui_tips_for_new_users
    # New teachers don't need to see the UI tips for their home and course pages,
    # so set them as already dismissed.
    self.ui_tip_dismissed_homepage_header = true
    self.ui_tip_dismissed_teacher_courses = true
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
      begin
        user_script.script.nil?
      rescue
        # Getting user_script.script can raise if the script does not exist
        # In that case we should also reject this user_script.
        true
      end
    end
  end

  # Returns an array of hashes storing data for each unique course assigned to # sections that this user is a part of.
  # @return [Array{CourseData}]
  def assigned_courses
    section_courses.map do |course|
      {
        name: course[:name],
        title: data_t_suffix('course.name', course[:name], 'title'),
        description: data_t_suffix('course.name', course[:name], 'description_short'),
        link: course_path(course),
      }
    end
  end

  # Checks if there are any non-hidden scripts assigned to the user.
  # @return [Boolean]
  def any_visible_assigned_scripts?
    user_scripts.where("assigned_at").
      map {|user_script| Script.where(id: user_script.script.id, hidden: 'false')}.
      flatten.
      any?
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
    course_scripts_script_ids = section_courses.map(&:default_course_scripts).flatten.pluck(:script_id).uniq

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

    assigned_courses + user_script_data
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

  # Asynchronously enqueues an operation to update the level progress.
  # @return [Boolean] whether a new level has been completed.
  def track_level_progress_async(script_level:, level:, new_result:, submitted:, level_source_id:, pairing_user_ids:)
    level_id = level.id
    script_id = script_level.script_id
    old_user_level = UserLevel.where(
      user_id: id,
      level_id: level_id,
      script_id: script_id
    ).first

    async_op = {
      'model' => 'User',
      'action' => 'track_level_progress',
      'user_id' => id,
      'level_id' => level_id,
      'script_id' => script_id,
      'new_result' => new_result,
      'level_source_id' => level_source_id,
      'submitted' => submitted,
      'pairing_user_ids' => pairing_user_ids
    }
    if Gatekeeper.allows('async_activity_writes', where: {hostname: Socket.gethostname})
      User.progress_queue.enqueue(async_op.to_json)
    else
      User.handle_async_op(async_op)
    end

    old_result = old_user_level.try(:best_result)
    !ActivityConstants.passing?(old_result) && ActivityConstants.passing?(new_result)
  end

  # The synchronous handler for the track_level_progress helper.
  # @return [UserLevel]
  def self.track_level_progress_sync(user_id:, level_id:, script_id:, new_result:, submitted:, level_source_id:, pairing_user_ids: nil, is_navigator: false)
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
        navigator_user_level = User.track_level_progress_sync(
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

    # Create peer reviews after submitting a peer_reviewable solution
    if user_level.submitted && Level.cache_find(level_id).try(:peer_reviewable?)
      learning_module = Level.cache_find(level_id).script_levels.find_by(script_id: script_id).try(:stage).try(:plc_learning_module)

      if learning_module && Plc::EnrollmentModuleAssignment.exists?(user_id: user_id, plc_learning_module: learning_module)
        PeerReview.create_for_submission(user_level, level_source_id)
      end
    end

    if new_level_completed && script_id
      User.track_script_progress(user_id, script_id)
    end

    if new_csf_level_perfected && pairing_user_ids.blank? && !is_navigator
      User.track_proficiency(user_id, script_id, level_id)
    end
    user_level
  end

  def self.handle_async_op(op)
    raise 'Model must be User' if op['model'] != 'User'
    case op['action']
      when 'track_level_progress'
        User.track_level_progress_sync(
          user_id: op['user_id'],
          level_id: op['level_id'],
          script_id: op['script_id'],
          new_result: op['new_result'],
          submitted: op['submitted'],
          level_source_id: op['level_source_id'],
          pairing_user_ids: op['pairing_user_ids']
        )
      else
        raise "Unknown action in #{op}"
    end
  end

  # This method is called when a section the user belongs to is assigned to
  # a script. We find or create a new UserScript entry, and set assigned_at
  # if not already set.
  # @param script [Script] The script to assign.
  # @return [UserScript] The UserScript, new or existing, with assigned_at set.
  def assign_script(script)
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      user_script = UserScript.where(user: self, script: script).first_or_create
      user_script.update!(assigned_at: Time.now) unless user_script.assigned_at
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
      secret_picture_name: secret_picture.name,
      secret_picture_path: secret_picture.path,
      location: "/v2/users/#{id}",
      age: age,
      sharing_disabled: sharing_disabled?,
    }
  end

  def self.progress_queue
    AsyncProgressHandler.progress_queue
  end

  # We restrict certain users from editing their email address, because we
  # require a current password confirmation to edit email and some users don't
  # have passwords
  def can_edit_email?
    encrypted_password.present? || oauth?
  end

  # We restrict certain users from editing their password; in particular, those
  # users that don't have a password because they authenticate via oauth, secret
  # picture, or some other unusual method
  def can_edit_password?
    encrypted_password.present?
  end

  # Users who might otherwise have orphaned accounts should have the option
  # to create personal logins (using e-mail/password or oauth) so they can
  # continue to use our site without losing progress.
  def can_create_personal_login?
    teacher_managed_account? # once parent e-mail is added, we should check for it here
  end

  def teacher_managed_account?
    return false unless student?
    # We consider the account teacher-managed if the student can't reasonably log in on their own.
    # In some cases, a student might have a password but no e-mail (from our old UI)
    return false if encrypted_password.present? && hashed_email.present?
    return false if encrypted_password.present? && parent_email.present?
    # If a user either doesn't have a password or doesn't have an e-mail, then we check for oauth.
    !oauth?
  end

  def parent_managed_account?
    student? && parent_email.present? && hashed_email.blank?
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
    sections_to_check = teacher? ? sections : sections_as_student
    sections_to_check.any? do |section|
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

  def show_school_info_interstitial?
    SchoolInfoInterstitialHelper.show_school_info_interstitial?(self)
  end

  # Removes PII and other information from the user and marks the user as having been purged.
  # WARNING: This (permanently) destroys data and cannot be undone.
  # WARNING: This does not purge the user, only marks them as such.
  def clear_user_and_mark_purged
    random_suffix = (('0'..'9').to_a + ('a'..'z').to_a).sample(8).join

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
    self.properties = {}

    self.purged_at = Time.zone.now

    save!
  end

  def associate_with_potential_pd_enrollments
    if teacher?
      Pd::Enrollment.where(email: email, user: nil).each do |enrollment|
        enrollment.update(user: self)
      end
    end
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
          User.track_level_progress_sync(
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

  # Via the paranoia gem, undelete / undestroy the deleted / destroyed user and any (dependent)
  # destroys done around the time of the delete / destroy.
  # @raise [RuntimeError] If the user is purged.
  def undestroy
    raise 'Unable to restore a purged user' if purged_at

    # Paranoia documentation at https://github.com/rubysherpas/paranoia#usage.
    restore(recursive: true, recovery_window: 5.minutes)
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

    assigned_sections = sections.select do |section|
      hidden_stages && section.script_id == assign_id || !hidden_stages && section.course_id == assign_id
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
end

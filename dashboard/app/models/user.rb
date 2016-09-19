# == Schema Information
#
# Table name: users
#
#  id                         :integer          not null, primary key
#  email                      :string(255)      default(""), not null
#  encrypted_password         :string(255)      default("")
#  reset_password_token       :string(255)
#  reset_password_sent_at     :datetime
#  remember_created_at        :datetime
#  sign_in_count              :integer          default(0)
#  current_sign_in_at         :datetime
#  last_sign_in_at            :datetime
#  current_sign_in_ip         :string(255)
#  last_sign_in_ip            :string(255)
#  created_at                 :datetime
#  updated_at                 :datetime
#  username                   :string(255)
#  provider                   :string(255)
#  uid                        :string(255)
#  admin                      :boolean
#  gender                     :string(1)
#  name                       :string(255)
#  locale                     :string(10)       default("en-US"), not null
#  birthday                   :date
#  user_type                  :string(16)
#  school                     :string(255)
#  full_address               :string(1024)
#  total_lines                :integer          default(0), not null
#  prize_earned               :boolean          default(FALSE)
#  prize_id                   :integer
#  teacher_prize_earned       :boolean          default(FALSE)
#  teacher_prize_id           :integer
#  teacher_bonus_prize_earned :boolean          default(FALSE)
#  teacher_bonus_prize_id     :integer
#  confirmation_token         :string(255)
#  confirmed_at               :datetime
#  confirmation_sent_at       :datetime
#  unconfirmed_email          :string(255)
#  prize_teacher_id           :integer
#  secret_picture_id          :integer
#  active                     :boolean          default(TRUE), not null
#  hashed_email               :string(255)
#  deleted_at                 :datetime
#  secret_words               :string(255)
#  properties                 :text(65535)
#  invitation_token           :string(255)
#  invitation_created_at      :datetime
#  invitation_sent_at         :datetime
#  invitation_accepted_at     :datetime
#  invitation_limit           :integer
#  invited_by_id              :integer
#  invited_by_type            :string(255)
#  invitations_count          :integer          default(0)
#  terms_of_service_version   :integer
#
# Indexes
#
#  index_users_on_confirmation_token_and_deleted_at      (confirmation_token,deleted_at) UNIQUE
#  index_users_on_email_and_deleted_at                   (email,deleted_at)
#  index_users_on_hashed_email_and_deleted_at            (hashed_email,deleted_at)
#  index_users_on_invitation_token                       (invitation_token) UNIQUE
#  index_users_on_invitations_count                      (invitations_count)
#  index_users_on_invited_by_id                          (invited_by_id)
#  index_users_on_prize_id_and_deleted_at                (prize_id,deleted_at) UNIQUE
#  index_users_on_provider_and_uid_and_deleted_at        (provider,uid,deleted_at) UNIQUE
#  index_users_on_reset_password_token_and_deleted_at    (reset_password_token,deleted_at) UNIQUE
#  index_users_on_teacher_bonus_prize_id_and_deleted_at  (teacher_bonus_prize_id,deleted_at) UNIQUE
#  index_users_on_teacher_prize_id_and_deleted_at        (teacher_prize_id,deleted_at) UNIQUE
#  index_users_on_unconfirmed_email_and_deleted_at       (unconfirmed_email,deleted_at)
#  index_users_on_username_and_deleted_at                (username,deleted_at) UNIQUE
#

require 'digest/md5'
require 'cdo/user_helpers'

class User < ActiveRecord::Base
  include SerializedProperties
  serialized_attrs %w(ops_first_name ops_last_name district_id ops_school ops_gender)

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable
  devise :invitable, :database_authenticatable, :registerable, :omniauthable, :confirmable,
    :recoverable, :rememberable, :trackable

  acts_as_paranoid # use deleted_at column instead of deleting rows

  PROVIDER_MANUAL = 'manual' # "old" user created by a teacher -- logs in w/ username + password
  PROVIDER_SPONSORED = 'sponsored' # "new" user created by a teacher -- logs in w/ name + secret picture/word

  OAUTH_PROVIDERS = %w{facebook twitter windowslive google_oauth2 clever}

  # :user_type is locked. Use the :permissions property for more granular user permissions.
  TYPE_STUDENT = 'student'
  TYPE_TEACHER = 'teacher'
  USER_TYPE_OPTIONS = [TYPE_STUDENT, TYPE_TEACHER]
  validates_inclusion_of :user_type, in: USER_TYPE_OPTIONS

  has_many :permissions, class_name: 'UserPermission', dependent: :destroy
  has_many :hint_view_requests

  # Teachers can be in multiple cohorts
  has_and_belongs_to_many :cohorts

  # workshops that I am attending
  has_many :workshops, through: :cohorts
  has_many :segments, through: :workshops

  has_and_belongs_to_many :workshops_as_facilitator,
    class_name: Workshop,
    foreign_key: :facilitator_id,
    join_table: :facilitators_workshops

  # you can be associated with a district if you are the district contact
  has_one :district_as_contact,
    class_name: 'District',
    foreign_key: 'contact_id'

  has_many :districts_users, class_name: 'DistrictsUsers'
  has_many :districts, through: :districts_users

  belongs_to :invited_by, :polymorphic => true

  # TODO: I think we actually want to do this.
  # You can be associated with districts through cohorts
  # has_many :districts, through: :cohorts.

  def facilitator?
    permission? UserPermission::FACILITATOR
  end

  def workshop_organizer?
    permission? UserPermission::WORKSHOP_ORGANIZER
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
    if @permissions.nil?
      # The user's permissions have not yet been cached, so do the DB query,
      # caching the results.
      @permissions = UserPermission.where(user_id: id).pluck(:permission)
    end
    # Return the cached results.
    return @permissions.include? permission
  end

  def district_contact?
    district_as_contact.present?
  end

  def district
    District.find(district_id) if district_id
  end

  def district_name
    district.try(:name)
  end

  def self.find_or_create_teacher(params, invited_by_user, permission = nil)
    user = User.find_by_email_or_hashed_email(params[:email])
    unless user
      # initialize new users with name and school
      if params[:ops_first_name] || params[:ops_last_name]
        params[:name] ||= [params[:ops_first_name], params[:ops_last_name]].flatten.join(" ")
      end
      params[:school] ||= params[:ops_school]

      user = User.invite!(email: params[:email],
                          user_type: TYPE_TEACHER, age: 21)
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

  GENDER_OPTIONS = [[nil, ''], ['gender.male', 'm'], ['gender.female', 'f'], ['gender.none', '-']]

  attr_accessor :login

  has_many :plc_enrollments, class_name: '::Plc::UserCourseEnrollment', dependent: :destroy

  has_many :user_levels, -> {order 'id desc'}
  has_many :activities

  has_many :gallery_activities, -> {order 'id desc'}

  # student/teacher relationships where I am the teacher
  has_many :followers
  has_many :students, through: :followers, source: :student_user
  has_many :sections

  # student/teacher relationships where I am the student
  has_many :followeds, -> {order 'followers.id'}, class_name: 'Follower', foreign_key: 'student_user_id'
  has_many :teachers, through: :followeds, source: :user
  has_many :sections_as_student, through: :followeds, source: :section

  has_one :prize
  has_one :teacher_prize
  has_one :teacher_bonus_prize

  belongs_to :secret_picture
  before_create :generate_secret_picture

  before_create :generate_secret_words

  # a bit of trickery to sort most recently started/assigned/progressed scripts first and then completed
  has_many :user_scripts, -> {order "-completed_at asc, greatest(coalesce(started_at, 0), coalesce(assigned_at, 0), coalesce(last_progress_at, 0)) desc, user_scripts.id asc"}
  has_many :scripts, -> {where hidden: false}, through: :user_scripts, source: :script

  validates :name, presence: true
  validates :name, length: {within: 1..70}, allow_blank: true
  validates :name, no_utf8mb4: true

  validates :age, presence: true, on: :create # only do this on create to avoid problems with existing users
  AGE_DROPDOWN_OPTIONS = (4..20).to_a << "21+"
  validates :age, presence: false, inclusion: {in: AGE_DROPDOWN_OPTIONS}, allow_blank: true

  USERNAME_REGEX = /\A#{UserHelpers::USERNAME_ALLOWED_CHARACTERS.source}+\z/i
  validates_length_of :username, within: 5..20, allow_blank: true
  validates_format_of :username, with: USERNAME_REGEX, on: :create, allow_blank: true
  validates_uniqueness_of :username, allow_blank: true, case_sensitive: false, on: :create, if: 'errors.blank?'
  validates_presence_of :username, if: :username_required?
  before_validation :generate_username, on: :create

  validates_uniqueness_of :prize_id, allow_nil: true
  validates_uniqueness_of :teacher_prize_id, allow_nil: true
  validates_uniqueness_of :teacher_bonus_prize_id, allow_nil: true

  validates_presence_of     :password, if: :password_required?
  validates_confirmation_of :password, if: :password_required?
  validates_length_of       :password, within: 6..128, allow_blank: true

  # When adding a new version, append to the end of the array
  # using the next increasing natural number.
  TERMS_OF_SERVICE_VERSIONS = [
    1  # (July 2016) Teachers can grant access to labs for U13 students.
  ]
  validates :terms_of_service_version,
    inclusion: {in: TERMS_OF_SERVICE_VERSIONS},
    allow_nil: true

  def dont_reconfirm_emails_that_match_hashed_email
    # we make users "reconfirm" when they change their email
    # addresses. Skip reconfirmation when the user is using the same
    # email but it appears that the email is changed because it was
    # hashed and is not now hashed
    if email.present? && hashed_email == User.hash_email(email.downcase)
      skip_reconfirmation!
    end
  end

  # NOTE: Order is important here.
  before_save :make_teachers_21,
    :dont_reconfirm_emails_that_match_hashed_email,
    :hash_email,
    :hide_email_and_full_address_for_students

  def make_teachers_21
    return unless teacher?
    self.age = 21
  end

  def self.hash_email(email)
    Digest::MD5.hexdigest(email.downcase)
  end

  def hash_email
    return unless email.present?
    self.hashed_email = User.hash_email(email)
  end

  def hide_email_and_full_address_for_students
    if student?
      self.email = ''
      self.full_address = nil
    end
  end

  def self.find_by_email_or_hashed_email(email)
    return nil if email.blank?

    User.find_by_email(email.downcase) ||
      User.find_by(email: '', hashed_email: User.hash_email(email.downcase))
  end

  def self.find_channel_owner(encrypted_channel_id)
    owner_storage_id, _ = storage_decrypt_channel_id(encrypted_channel_id)
    user_id = PEGASUS_DB[:user_storage_ids].first(id: owner_storage_id)[:user_id]
    User.find(user_id)
  end

  validate :presence_of_email, if: :teacher?
  validate :presence_of_email_or_hashed_email, if: :email_required?, on: :create
  validates_format_of :email, with: Devise.email_regexp, allow_blank: true, if: :email_changed?
  validates :email, no_utf8mb4: true
  validate :email_and_hashed_email_must_be_unique, if: 'email_changed? || hashed_email_changed?'

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

  CLEVER_ADMIN_USER_TYPES = ['district_admin', 'school_admin']
  def self.from_omniauth(auth, params)
    def self.name_from_omniauth(raw_name)
      return raw_name if raw_name.blank? || raw_name.is_a?(String) # some services just give us a string
      # clever returns a hash instead of a string for name
      "#{raw_name['first']} #{raw_name['last']}".squish
    end

    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.provider = auth.provider
      user.uid = auth.uid
      user.name = name_from_omniauth auth.info.name
      user.email = auth.info.email
      user.user_type = params['user_type'] || auth.info.user_type || User::TYPE_STUDENT

      # treat clever admin types as teachers
      if CLEVER_ADMIN_USER_TYPES.include? user.user_type
        user.user_type = User::TYPE_TEACHER
      end

      # clever provides us these fields
      if user.user_type == TYPE_TEACHER
        # if clever told us that the user is a teacher, we just trust
        # that they are adults; we don't actually care about age
        user.age = 21
      else
        # student or unspecified type
        user.birthday = auth.info.dob
      end
      user.gender = normalize_gender auth.info.gender
    end
  end

  def oauth?
    OAUTH_PROVIDERS.include? provider
  end

  def self.new_with_session(params, session)
    if session["devise.user_attributes"]
      new(session["devise.user_attributes"]) do |user|
        user.attributes = params
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
    return true if teacher? || admin?
    return false if provider == User::PROVIDER_MANUAL
    return false if provider == User::PROVIDER_SPONSORED
    return false if oauth?
    true
  end

  def username_required?
    provider == User::PROVIDER_MANUAL
  end

  def update_with_password(params, *options)
    if encrypted_password.blank?
      params.delete(:current_password) # user does not have password so current password is irrelevant
      update_attributes(params, *options)
    else
      super
    end
  end

  # overrides Devise::Authenticatable#find_first_by_auth_conditions
  # see https://github.com/plataformatec/devise/blob/master/lib/devise/models/authenticatable.rb#L245
  def self.find_for_authentication(tainted_conditions)
    conditions = devise_parameter_filter.filter(tainted_conditions.dup)
    # we get either a login (username) or hashed_email
    login = conditions.delete(:login)
    if login.present?
      return nil if login.utf8mb4?
      where(['username = :value OR email = :value OR hashed_email = :hashed_value',
             { value: login.downcase, hashed_value: hash_email(login.downcase) }]).first
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

  # cache and return (from cache, if present) all user levels for this script for this user.
  # The cache lifetime is the current HTTP request.
  def cached_user_levels_by_script(script_id)
    @user_level_cache_by_script ||= {}
    if @user_level_cache_by_script[script_id].nil?
      # make a database dip to get user_levels
      @user_level_cache_by_script[script_id] =
        user_levels.where(script_id: script_id).index_by(&:level_id)
    end
    @user_level_cache_by_script[script_id]
  end

  # returns if all user levels for this script have been cached
  def user_levels_cached_for_script?(script_id)
    @user_level_cache_by_script[script_id].nil? ? false : true
  end

  # returns specified user level from cache, if present
  def user_level_from_cache(script_id, level_id)
    @user_level_cache_by_script.try(:[], script_id).try(:[], level_id)
  end

  def user_levels_by_level(script)
    cached_user_levels_by_script(script.id)
  end

  def user_progress_by_stage(stage)
    levels = stage.script_levels.map(&:level_ids).flatten
    user_levels.where(script: stage.script, level: levels).pluck(:level_id, :best_result).to_h
  end

  def user_level_for(script_level, level)
    # see if we have cached all user levels for this script
    if user_levels_cached_for_script?(script_level.script_id)
      # if so, return from cache. Note that nil is a possible return value from cache
      # (which means specified saved user level does not exist). We deliberately don't fall through
      # to a database dip if nil.
      return user_level_from_cache(script_level.script_id, level.id)
    end

    # Do a database query to get the user_level. We deliberately do not try to further cache this
    # result.
    user_levels.find_by(script_id: script_level.script_id,
      level_id: level.id)
  end

  def user_level_locked?(script_level, level)
    return false unless script_level.stage.lockable?
    return false if authorized_teacher?
    user_level = user_level_for(script_level, level)
    user_level.nil? || user_level.locked?(script_level.stage)
  end

  def next_unpassed_progression_level(script)
    user_levels_by_level = user_levels_by_level(script)

    script.script_levels.detect do |script_level|
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
  def last_attempt(level)
    UserLevel.where(user_id: self.id, level_id: level.id).
      order('updated_at DESC').
      first
  end

  # Returns the most recent (via updated_at) user_level for any of the specified
  # levels.
  def last_attempt_for_any(levels, script_id: nil)
    level_ids = levels.map(&:id)
    conditions = {
      user_id: self.id,
      level_id: level_ids
    }
    conditions[:script_id] = script_id unless script_id.nil?
    UserLevel.where(conditions).
      order('updated_at DESC').
      first
  end

  def student?
    self.user_type == TYPE_STUDENT
  end

  def teacher?
    self.user_type == TYPE_TEACHER
  end

  def student_of_admin?
    teachers.any?(&:admin?)
  end

  def authorized_teacher?
    # you are "really" a teacher if you are a teacher in any cohort for an ops workshop or in a plc course
    admin? || (teacher? && (cohorts.present? || plc_enrollments.present?)) ||
      permission?(UserPermission::LEVELBUILDER)
  end

  def student_of_authorized_teacher?
    teachers.any?(&:authorized_teacher?)
  end

  def student_of?(teacher)
    followeds.find_by_user_id(teacher.id).present?
  end

  def locale
    read_attribute(:locale).try(:to_sym)
  end

  def confirmation_required?
    self.teacher? && !self.confirmed?
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
    age = ((Date.today - birthday) / 365).to_i
    age = "21+" if age >= 21
    age
  end

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
    return nil if name.blank?
    return name.strip[0].upcase
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
      self.update_attribute(:encrypted_password, spicy_password)
      return true
    end

    return false
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

    user = find_by_email_or_hashed_email(attributes[:email]) || User.new(email: attributes[:email])
    if user && user.persisted?
      user.raw_token = user.send_reset_password_instructions(attributes[:email]) # protected in the superclass
    else
      user.errors.add :email, :not_found
    end
    user
  end

  def send_reset_password_instructions(email)
    raw, enc = Devise.token_generator.generate(self.class, :reset_password_token)

    self.reset_password_token   = enc
    self.reset_password_sent_at = Time.now.utc
    self.save(validate: false)

    send_devise_notification(:reset_password_instructions, raw, {to: email})
    raw
  end

  def generate_secret_picture
    self.secret_picture = SecretPicture.random
  end

  def generate_secret_words
    self.secret_words = [SecretWord.random.word, SecretWord.random.word].join(" ")
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
    [working_on_user_scripts, completed_user_scripts].compact.flatten
  end

  def all_advertised_scripts_completed?
    advertised_scripts.all? { |script| completed?(script) }
  end

  def completed?(script)
    user_script = user_scripts.where(script_id: script.id).first
    user_script.try(:completed_at) || (user_script && next_unpassed_progression_level(script).nil?)
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
    backfill_user_scripts if needs_to_backfill_user_scripts?

    scripts.where('user_scripts.completed_at is null').map(&:cached)
  end

  def working_on_user_scripts
    backfill_user_scripts if needs_to_backfill_user_scripts?

    user_scripts.where('user_scripts.completed_at is null')
  end

  def completed_user_scripts
    backfill_user_scripts if needs_to_backfill_user_scripts?

    user_scripts.where('user_scripts.completed_at is not null')
  end

  def primary_script
    working_on_scripts.first.try(:cached)
  end

  def needs_to_backfill_user_scripts?
    # Backfill only applies to users created before UserScript model was introduced.
    created_at < Date.new(2014, 9, 15) &&
      user_scripts.empty? &&
      !user_levels.empty?
  end

  # Creates UserScript information based on data contained in UserLevels.
  # Provides backwards compatibility with users created before the UserScript model
  # was introduced (cf. code-dot-org/website-ci#194).
  # TODO apply this migration to all users in database, then remove.
  def backfill_user_scripts
    # backfill assigned scripts
    followeds.each do |follower|
      script = follower.section && follower.section.script
      next unless script

      Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
        user_script = UserScript.find_or_initialize_by(user_id: self.id, script_id: script.id)
        user_script.assigned_at = follower.created_at if
          follower.created_at &&
          (!user_script.assigned_at || follower.created_at < user_script.assigned_at)

        user_script.save! if user_script.changed? && !user_script.empty?
      end
    end

    # backfill progress in scripts
    Script.all.each do |script|
      Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
        user_script = UserScript.find_or_initialize_by(user_id: self.id, script_id: script.id)
        ul_map = user_levels_by_level(script)
        script.script_levels.each do |sl|
          ul = ul_map[sl.level_id]
          next unless ul
          # is this the first level we started?
          user_script.started_at = ul.created_at if
            ul.created_at &&
            (!user_script.started_at || ul.created_at < user_script.started_at)

          # is this the last level we worked on?
          user_script.last_progress_at = ul.updated_at if
            ul.updated_at &&
            (!user_script.last_progress_at || ul.updated_at > user_script.last_progress_at)
        end

        # backfill completed scripts
        if user_script.last_progress_at && user_script.check_completed?
          user_script.completed_at = user_script.last_progress_at
        end

        user_script.save! if user_script.changed? && !user_script.empty?
      end
    end
  end

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
    level_concept_difficulty = LevelConceptDifficulty.where(level_id: level_id).first
    unless level_concept_difficulty
      return
    end

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
          user_proficiency.basic_proficiency?
        user_proficiency.basic_proficiency_at = time_now
      end

      user_proficiency.save!
    end
  end

  # returns whether a new level has been completed and asynchronously enqueues an operation
  # to update the level progress.
  def track_level_progress_async(script_level:, level:, new_result:, submitted:, level_source_id:, pairings:)
    level_id = level.id
    script_id = script_level.script_id
    old_user_level = UserLevel.where(
      user_id: self.id,
      level_id: level_id,
      script_id: script_id
    ).first

    async_op = {
      'model' => 'User',
      'action' => 'track_level_progress',
      'user_id' => self.id,
      'level_id' => level_id,
      'script_id' => script_id,
      'new_result' => new_result,
      'level_source_id' => level_source_id,
      'submitted' => submitted,
      'pairing_user_ids' => pairings ? pairings.map(&:id) : nil
    }
    if Gatekeeper.allows('async_activity_writes', where: {hostname: Socket.gethostname})
      User.progress_queue.enqueue(async_op.to_json)
    else
      User.handle_async_op(async_op)
    end

    old_result = old_user_level.try(:best_result)
    !Activity.passing?(old_result) && Activity.passing?(new_result)
  end

  # The synchronous handler for the track_level_progress helper.
  def self.track_level_progress_sync(user_id:, level_id:, script_id:, new_result:, submitted:, level_source_id:, pairing_user_ids: nil, is_navigator: false)
    new_level_completed = false
    new_level_perfected = false

    user_level = nil
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      user_level = UserLevel.
        where(user_id: user_id, level_id: level_id, script_id: script_id).
        first_or_create!

      new_level_completed = true if !user_level.passing? &&
        Activity.passing?(new_result)
      new_level_perfected = true if !user_level.perfect? &&
        new_result == 100 &&
        HintViewRequest.
          where(user_id: user_id, script_id: script_id, level_id: level_id).
          empty? &&
        AuthoredHintViewRequest.
          where(user_id: user_id, script_id: script_id, level_id: level_id).
          empty?

      # Update user_level with the new attempt.
      user_level.attempts += 1 unless user_level.best?
      user_level.best_result = new_result if user_level.best_result.nil? ||
        new_result > user_level.best_result
      user_level.submitted = submitted
      if level_source_id && !is_navigator
        user_level.level_source_id = level_source_id
      end

      user_level.save!
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
    if user_level.submitted && Level.cache_find(level_id).try(:peer_reviewable)
      PeerReview.create_for_submission(user_level, level_source_id)
    end

    if new_level_completed && script_id
      User.track_script_progress(user_id, script_id)
    end

    if new_level_perfected && pairing_user_ids.blank? && !is_navigator
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

  def assign_script(script)
    Retryable.retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      user_script = UserScript.where(user: self, script: script).first_or_create
      user_script.assigned_at = Time.now

      user_script.save!
      return user_script
    end
  end

  def recent_activities(limit = 10)
    self.activities.order('id desc').limit(limit)
  end

  def can_pair?
    !sections_as_student.empty?
  end

  def can_pair_with?(other_user)
    self != other_user && sections_as_student.any?{ |section| other_user.sections_as_student.include? section }
  end

  def self.csv_attributes
    # same as in UserSerializer
    [:id, :email, :ops_first_name, :ops_last_name, :district_name, :ops_school, :ops_gender]
  end

  def to_csv
    User.csv_attributes.map{ |attr| self.send(attr) }
  end

  def self.progress_queue
    AsyncProgressHandler.progress_queue
  end

  # can this user edit their own account?
  def can_edit_account?
    return true if teacher? || encrypted_password.present? || oauth?

    # sections_as_student should be a method but I already did that in another branch so I'm avoiding conflicts for now
    sections_as_student = followeds.collect(&:section)
    return true if sections_as_student.empty?

    # if you log in only through picture passwords you can't edit your account
    return !(sections_as_student.all? {|section| section.login_type == Section::LOGIN_TYPE_PICTURE})
  end

  def section_for_script(script)
    followeds.collect(&:section).find { |section| section.script_id == script.id }
  end

  # Returns the version of our Terms of Service we consider the user as having
  # accepted. For teachers, this is the latest major version of the Terms of
  # Service accepted. For students, this is the latest major version accepted by
  # any their teachers.
  def terms_version
    if teacher?
      return terms_of_service_version
    end
    # As of August 2016, it may be the case that the `followed` exists but
    # `followed.user` does not as the result of user deletion. In this case, we
    # ignore any terms of service versions associated with deleted teacher
    # accounts.
    followeds.
      collect{|followed| followed.user.try(:terms_of_service_version)}.
      compact.
      max
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
    script = script_level.try(:script)
    authorized_teacher? && !script.try(:professional_course?) || (script_level &&
      UserLevel.find_by(user: self, level: script_level.level).try(:readonly_answers))
  end
end

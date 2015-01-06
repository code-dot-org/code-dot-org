require 'digest/md5'
require 'cdo/user_helpers'

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable
  devise :database_authenticatable, :registerable, :omniauthable, :confirmable,
         :recoverable, :rememberable, :trackable

  PROVIDER_MANUAL = 'manual' # "old" user created by a teacher -- logs in w/ username + password
  PROVIDER_SPONSORED = 'sponsored' # "new" user created by a teacher -- logs in w/ name + secret picture/word 

  OAUTH_PROVIDERS = %w{facebook twitter windowslive google_oauth2 clever}
  
  TYPE_STUDENT = 'student'
  TYPE_TEACHER = 'teacher'
  USER_TYPE_OPTIONS = [TYPE_STUDENT, TYPE_TEACHER]
  validates_inclusion_of :user_type, in: USER_TYPE_OPTIONS, on: :create

  GENDER_OPTIONS = [[nil, ''], ['gender.male', 'm'], ['gender.female', 'f'], ['gender.none', '-']]

  STUDENTS_COMPLETED_FOR_PRIZE = 15
  STUDENTS_FEMALE_FOR_BONUS = 7

  attr_accessor :login

  has_many :user_levels
  has_many :activities

  has_many :gallery_activities, -> {order 'id desc'}

  has_many :sections

  has_many :user_trophies
  has_many :trophies, through: :user_trophies, source: :trophy

  has_many :followers
  has_many :followeds, -> {order 'id'}, class_name: 'Follower', foreign_key: 'student_user_id'

  has_many :students, through: :followers, source: :student_user
  has_many :teachers, through: :followeds, source: :user

  has_one :prize
  has_one :teacher_prize
  has_one :teacher_bonus_prize

  belongs_to :secret_picture
  before_create :generate_secret_picture
  
  belongs_to :secret_word_1, class_name: SecretWord
  belongs_to :secret_word_2, class_name: SecretWord
  before_create :generate_secret_words

  # a bit of trickery to sort most recently started/assigned/progressed scripts first and then completed
  has_many :user_scripts, -> {order "-completed_at asc, greatest(coalesce(started_at, 0), coalesce(assigned_at, 0), coalesce(last_progress_at, 0)) desc, id asc"}
  has_many :scripts, -> {where hidden: false}, through: :user_scripts, source: :script

  validates :name, presence: true
  validates :name, length: {within: 1..70}, allow_blank: true

  validates :age, presence: true, on: :create # only do this on create to avoid problems with existing users
  AGE_DROPDOWN_OPTIONS = (4..20).to_a << "21+"
  validates :age, presence: false, inclusion: {in: AGE_DROPDOWN_OPTIONS}, allow_blank: true

  validates_length_of :parent_email, maximum: 255

  USERNAME_REGEX = /\A#{UserHelpers::USERNAME_ALLOWED_CHARACTERS.source}+\z/i
  validates_length_of :username, within: 5..20, allow_blank: true
  validates_format_of :username, with: USERNAME_REGEX, on: :create, allow_blank: true
  validates_uniqueness_of :username, allow_blank: true, case_sensitive: false
  validates_presence_of :username, if: :username_required?
  before_validation :generate_username, on: :create

  validates_uniqueness_of :prize_id, allow_nil: true
  validates_uniqueness_of :teacher_prize_id, allow_nil: true
  validates_uniqueness_of :teacher_bonus_prize_id, allow_nil: true

  validates_presence_of     :password, if: :password_required?
  validates_confirmation_of :password, if: :password_required?
  validates_length_of       :password, within: 6..128, allow_blank: true
  
  after_create :codeorg_admin unless Rails.env.production?
  def codeorg_admin
    require 'mail'
    update(admin: true) if Mail::Address.new(email).domain.try(:downcase) == 'code.org'
  end

  before_save :hash_email, :hide_email_for_younger_users # order is important here ;)

  def User.hash_email(email)
    Digest::MD5.hexdigest(email.downcase)
  end

  def hash_email
    return unless email.present?
    self.hashed_email = User.hash_email(email)
  end

  def hide_email_for_younger_users
    if age && under_13?
      self.email = ''
    end
  end

  def User.find_by_email_or_hashed_email(email)
    User.find_by_email(email.downcase) ||
      User.find_by(email: '', hashed_email: User.hash_email(email.downcase))
  end

  validate :email_and_hashed_email_must_be_unique

  validate :presence_of_email_or_hashed_email, if: :email_required?, on: :create
  validate :email_and_hashed_email_must_be_unique, if: 'email_changed? || hashed_email_changed?'
  validates_format_of :email, with: Devise.email_regexp, allow_blank: true, if: :email_changed?

  def presence_of_email_or_hashed_email
    if email.blank? && hashed_email.blank?
      errors.add :email, I18n.t('activerecord.errors.messages.blank')
    end
  end

  def email_and_hashed_email_must_be_unique
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

  def self.from_omniauth(auth, params)
    def self.name_from_omniauth(raw_name)
      return raw_name if raw_name.blank? || raw_name.is_a?(String) # some services just give us a string
      # clever returns a hash instead of a string for name
      "#{raw_name['first']} #{raw_name['last']}".squish
    end

    where(auth.slice(:provider, :uid)).first_or_create do |user|
      user.provider = auth.provider
      user.uid = auth.uid
      user.name = name_from_omniauth auth.info.name
      user.email = auth.info.email
      user.user_type = params['user_type'] || auth.info.user_type || User::TYPE_STUDENT

      # clever provides us these fields
      if auth.info.user_type == TYPE_TEACHER
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
    if login = conditions.delete(:login)
      where(['username = :value OR email = :value OR hashed_email = :hashed_value',
             { value: login.downcase, hashed_value: hash_email(login.downcase) }]).first
    elsif hashed_email = conditions.delete(:hashed_email)
      where(hashed_email: hashed_email).first
    else
      nil
    end
  end

  def levels_from_script(script, game_index=nil, stage=nil)
    ul_map = self.user_levels.includes({level: [:game, :concepts]}).index_by(&:level_id)
    q = script.script_levels.includes({ level: :game }, :script, :stage).order((stage ? :position : :chapter))

    if stage
      q = q.where(['stages.id = :stage_id', { :stage_id => stage}]).references(:stage)
    elsif game_index
      q = q.where(['games.id = :game_id', { :game_id => game_index}]).references(:game)
    end

    q.each do |sl|
      ul = ul_map[sl.level_id]
      sl.user_level = ul
    end
  end

  def next_unpassed_progression_level(script)
    user_levels_by_level = self.user_levels.index_by(&:level_id)
    cached_script = script
    cached_script = Script.get_from_cache(script.id) if script.should_be_cached?
    
    cached_script.script_levels.detect do |script_level|
      user_level = user_levels_by_level[script_level.level_id]
      is_unpassed_progression_level(script_level, user_level)
    end
  end

  def is_unpassed_progression_level(script_level, user_level)
    is_passed = (user_level && user_level.passing?)
    script_level.valid_progression_level? && !is_passed
  end

  def progress(script)
    #trophy_id summing is a little hacky, but efficient. It takes advantage of the fact that:
    #broze id: 1, silver id: 2 and gold id: 3
    User.connection.select_one(<<SQL)
select
  count(case when ul.best_result >= #{Activity::MINIMUM_PASS_RESULT} then 1 else null end) as current_levels,
  count(*) as max_levels,
  (select coalesce(sum(trophy_id), 0) from user_trophies where user_id = #{self.id}) as current_trophies,
  (select count(*) * 3 from concepts) as max_trophies
from script_levels sl
left outer join user_levels ul on ul.level_id = sl.level_id and ul.user_id = #{self.id}
where sl.script_id = #{script.id}
SQL
  end

  def concept_progress(script = Script.twenty_hour_script)
    # todo: cache everything but the user's progress
    user_levels_map = self.user_levels.includes([{level: :concepts}]).index_by(&:level_id)
    user_trophy_map = self.user_trophies.includes(:trophy).index_by(&:concept_id)
    result = Hash.new{|h,k| h[k] = {obj: k, current: 0, max: 0}}

    script.levels.includes(:concepts).each do |level|
      level.concepts.each do |concept|
        result[concept][:current] += 1 if user_levels_map[level.id].try(:best_result).to_i >= Activity::MINIMUM_PASS_RESULT
        result[concept][:max] += 1
        result[concept][:trophy] ||= user_trophy_map[concept.id]
      end
    end
    result
  end

  def last_attempt(level)
    Activity.where(user_id: self.id, level_id: level.id).order('id desc').first
  end

  # returns a map from section to the users in that section
  def students_by_section
    class_map = Hash.new{ |h,k| h[k] = [] }
    self.followers.includes([:section, :student_user]).each do |f|
      class_map[f.section] << f.student_user
    end
    class_map
  end

  def average_student_trophies
    User.connection.select_value(<<SQL)
select coalesce(avg(num), 0)
from (
    select coalesce(sum(trophy_id), 0) as num
    from followers f
    left outer join user_trophies ut on f.student_user_id = ut.user_id
    where f.user_id = #{self.id}
    group by f.student_user_id
    ) trophy_counts
SQL
  end

  def trophy_count
    User.connection.select_value(<<SQL)
select coalesce(sum(trophy_id), 0) as num
from user_trophies
where user_id = #{self.id}
SQL
  end

  def student?
    self.user_type == TYPE_STUDENT
  end

  def teacher?
    self.user_type == TYPE_TEACHER
  end

  def locale
    read_attribute(:locale).try(:to_sym)
  end

  def writable_by?(other_user)
    return true if other_user == self
    return true if other_user.admin?
    return true if self.email.blank? && self.teachers.include?(other_user)
    false
  end

  def confirmation_required?
    (self.teacher? || self.students.length > 0) && !self.confirmed?
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
    val = val.to_i
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
    return if name.blank?
    self.username = UserHelpers.generate_username(User, name)
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
    bcrypt   = ::BCrypt::Password.new(encrypted_password)
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

  def User.send_reset_password_instructions(attributes={})
    # override of Devise method
    if attributes[:email].blank?
      user = User.new
      user.errors.add :email, I18n.t('activerecord.errors.messages.blank')
      return user
    end

    user = find_by_email_or_hashed_email(attributes[:email]) || User.new(email: attributes[:email])
    if user && user.persisted?
      user.send_reset_password_instructions(attributes[:email]) # protected in the superclass
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

  # Secret word stuff

  def generate_secret_picture
    self.secret_picture = SecretPicture.random
  end

  def reset_secret_picture
    generate_secret_picture
    save!
  end

  def secret_words
    return nil unless secret_word_1 && secret_word_2
    "#{secret_word_1.word} #{secret_word_2.word}"
  end

  def generate_secret_words
    self.secret_word_1 = SecretWord.random
    self.secret_word_2 = SecretWord.random
  end

  def reset_secret_words
    generate_secret_words
    save!
  end

  def working_on_scripts
    backfill_user_scripts if needs_to_backfill_user_scripts?

    scripts.where('user_scripts.completed_at is null')
  end

  def completed_scripts
    backfill_user_scripts if needs_to_backfill_user_scripts?

    scripts.where('user_scripts.completed_at is not null')
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
    working_on_scripts.first
  end

  def needs_to_backfill_user_scripts?
    user_scripts.empty? && !user_levels.empty?
  end

  def backfill_user_scripts
    # backfill assigned scripts
    followeds.each do |follower|
      script = follower.section && follower.section.script
      next unless script
        
      retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
        user_script = UserScript.find_or_initialize_by(user_id: self.id, script_id: script.id)
        user_script.assigned_at = follower.created_at if
          follower.created_at &&
          (!user_script.assigned_at || follower.created_at < user_script.assigned_at)

        user_script.save! if user_script.changed? && !user_script.empty?
      end
    end

    # backfill progress in scripts
    Script.all.each do |script|
      retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
        user_script = UserScript.find_or_initialize_by(user_id: self.id, script_id: script.id)
        levels_from_script(script).each do |sl|
          ul = sl.user_level
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

  def track_script_progress(script)
    retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      user_script = UserScript.where(user: self, script: script).first_or_create
      time_now = Time.now

      # doing this (instead of just user_script.save) avoids wrapping
      # the update in a transaction (which could be an epty
      # transaction (?!)

      update = {}
      update[:started_at] = time_now unless user_script.started_at
      update[:last_progress_at] = time_now 

      if !user_script.completed_at && user_script.check_completed?
        update[:completed_at] = time_now
      end

      # update_all bypasses validations/transactions/etc
      UserScript.where(id: user_script.id).update_all(update)
    end
  end

  # returns whether a new level has been completed
  def track_level_progress(script_level, new_result)
    retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      # this contortion is necessary while we are in the process of
      # migrating between UserLevels without scripts to UserLevels
      # with scripts. When this is done we can just do first_or_create

      user_level = UserLevel.where(user_id: self.id,
                                   level_id: script_level.level_id,
                                   script_id: [script_level.script_id, nil]).first

      unless user_level
        user_level = UserLevel.create(user_id: self.id,
                                      level_id: script_level.level_id,
                                      script_id: script_level.script_id)
      end

      update = {}
      update[:attempts] = user_level.attempts + 1 unless user_level.best?
      if user_level.best_result.nil? || new_result > user_level.best_result
        update[:best_result] = new_result
      end
      UserLevel.where(id: user_level.id).update_all(update) unless update.empty?

      return true if !user_level.passing? && Activity.passing?(new_result) # user_level is the old result
    end
    return false
  end

  def assign_script(script)
    retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
      user_script = UserScript.where(user: self, script: script).first_or_create
      user_script.assigned_at = Time.now

      user_script.save!
      return user_script
    end
  end

  def recent_activities(limit = 10)
    self.activities.order('id desc').limit(limit)
  end

  def hack_progress(options = {})
    options[:script_id] ||= Script.twenty_hour_script.id
    script = Script.find(options[:script_id])

    options[:levels] ||= script.script_levels.count / 2

    script.script_levels[0..options[:levels]].each do |sl|
      # create some fake testresults
      test_result = rand(100)

      Activity.create!(user: self, level: sl.level, test_result: test_result)
      
      if test_result > 10 # < 10 will be not attempted
        retryable on: [Mysql2::Error, ActiveRecord::RecordNotUnique], matching: /Duplicate entry/ do
          user_level = UserLevel.where(user: self, level: sl.level).first_or_create
          user_level.script_id = script.id
          user_level.attempts += 1 unless user_level.best?
          user_level.best_result = test_result
          user_level.save!
        end
      end
    end
    track_script_progress(script)
  end
  
end

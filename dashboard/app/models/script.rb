# == Schema Information
#
# Table name: scripts
#
#  id              :integer          not null, primary key
#  name            :string(255)      not null
#  created_at      :datetime
#  updated_at      :datetime
#  wrapup_video_id :integer
#  hidden          :boolean          default(FALSE), not null
#  user_id         :integer
#  login_required  :boolean          default(FALSE), not null
#  properties      :text(65535)
#  new_name        :string(255)
#  family_name     :string(255)
#
# Indexes
#
#  index_scripts_on_family_name      (family_name)
#  index_scripts_on_name             (name) UNIQUE
#  index_scripts_on_new_name         (new_name) UNIQUE
#  index_scripts_on_wrapup_video_id  (wrapup_video_id)
#

require 'cdo/script_constants'
require 'cdo/shared_constants'
require 'ruby-progressbar'

TEXT_RESPONSE_TYPES = [TextMatch, FreeResponse]

# A sequence of Levels
class Script < ApplicationRecord
  include ScriptConstants
  include SharedConstants
  include Rails.application.routes.url_helpers

  include Seeded
  has_many :lesson_groups, -> {order(:position)}, dependent: :destroy
  has_many :lessons, through: :lesson_groups
  has_many :script_levels, through: :lessons
  has_many :levels_script_levels, through: :script_levels # needed for seeding logic
  has_many :levels, through: :script_levels
  has_many :users, through: :user_scripts
  has_many :user_scripts
  has_many :hint_view_requests
  has_one :plc_course_unit, class_name: 'Plc::CourseUnit', inverse_of: :script, dependent: :destroy
  belongs_to :wrapup_video, foreign_key: 'wrapup_video_id', class_name: 'Video'
  belongs_to :user
  has_many :unit_group_units
  has_many :unit_groups, through: :unit_group_units
  has_one :course_version, as: :content_root

  scope :with_associated_models, -> do
    includes(
      [
        {
          script_levels: [
            {levels: [:game, :concepts, :level_concept_difficulty]},
            :lesson,
            :callouts
          ]
        },
        {
          lessons: [{script_levels: [:levels]}]
        },
        :unit_group_units
      ]
    )
  end

  # The set of models which may be touched by ScriptSeed
  scope :with_seed_models, -> do
    includes(
      [
        {
          unit_group_units: {
            unit_group: :course_version
          }
        },
        :course_version,
        :lesson_groups,
        {
          lessons: [
            {lesson_activities: :activity_sections},
            :resources,
            :vocabularies,
            :objectives
          ]
        },
        :script_levels,
        :levels
      ]
    )
  end

  attr_accessor :skip_name_format_validation
  include SerializedToFileValidation

  before_validation :hide_pilot_scripts

  def hide_pilot_scripts
    self.hidden = true unless pilot_experiment.blank?
  end

  # As we read and write to files with the script name, to prevent directory
  # traversal (for security reasons), we do not allow the name to start with a
  # tilde or dot or contain a slash.
  validates :name,
    presence: true,
    format: {
      without: /\A~|\A\.|\//,
      message: 'cannot start with a tilde or dot or contain slashes'
    }

  validate :set_is_migrated_only_for_migrated_scripts

  include SerializedProperties

  after_save :generate_plc_objects

  SCRIPT_DIRECTORY = "#{Rails.root}/config/scripts".freeze

  def set_is_migrated_only_for_migrated_scripts
    if !!is_migrated && !hidden
      errors.add(:is_migrated, "Can't be set on a course that is visible")
    end
  end

  def prevent_course_version_change?
    lessons.any? {|l| l.resources.count > 0 || l.vocabularies.count > 0}
  end

  def self.script_directory
    SCRIPT_DIRECTORY
  end

  SCRIPT_JSON_DIRECTORY = "#{Rails.root}/config/scripts_json".freeze

  def self.script_json_directory
    SCRIPT_JSON_DIRECTORY
  end

  def generate_plc_objects
    if professional_learning_course?
      unit_group = UnitGroup.find_by_name(professional_learning_course)
      unless unit_group
        unit_group = UnitGroup.new(name: professional_learning_course)
        unit_group.plc_course = Plc::Course.create!(unit_group: unit_group)
        unit_group.save!
      end
      unit = Plc::CourseUnit.find_or_initialize_by(script_id: id)
      unit.update!(
        plc_course_id: unit_group.plc_course.id,
        unit_name: I18n.t("data.script.name.#{name}.title"),
        unit_description: I18n.t("data.script.name.#{name}.description")
      )

      lessons.reload
      lessons.each do |lesson|
        lm = Plc::LearningModule.find_or_initialize_by(stage_id: lesson.id)
        lm.update!(
          plc_course_unit_id: unit.id,
          name: lesson.name,
          module_type: lesson.lesson_group&.key.presence || Plc::LearningModule::REQUIRED_MODULE,
        )
      end
    end
  end

  # is_course - true if this Script/Unit is intended to be the root of a CourseOffering version. Used during seeding
  #   to create the appropriate CourseVersion and CourseOffering objects. For example, this should be true for
  #   CourseA-CourseF .script files.
  serialized_attrs %w(
    hideable_lessons
    peer_reviews_to_complete
    professional_learning_course
    redirect_to
    student_detail_progress_view
    project_widget_visible
    project_widget_types
    teacher_resources
    lesson_extras_available
    has_verified_resources
    curriculum_path
    announcements
    version_year
    is_stable
    supported_locales
    pilot_experiment
    editor_experiment
    project_sharing
    curriculum_umbrella
    tts
    is_course
    background
    show_calendar
    weekly_instructional_minutes
    is_migrated
  )

  def self.twenty_hour_script
    Script.get_from_cache(Script::TWENTY_HOUR_NAME)
  end

  def self.hoc_2014_script
    Script.get_from_cache(Script::HOC_NAME)
  end

  def self.starwars_script
    Script.get_from_cache(Script::STARWARS_NAME)
  end

  def self.minecraft_script
    Script.get_from_cache(Script::MINECRAFT_NAME)
  end

  def self.starwars_blocks_script
    Script.get_from_cache(Script::STARWARS_BLOCKS_NAME)
  end

  def self.frozen_script
    Script.get_from_cache(Script::FROZEN_NAME)
  end

  def self.course1_script
    Script.get_from_cache(Script::COURSE1_NAME)
  end

  def self.course2_script
    Script.get_from_cache(Script::COURSE2_NAME)
  end

  def self.course3_script
    Script.get_from_cache(Script::COURSE3_NAME)
  end

  def self.course4_script
    Script.get_from_cache(Script::COURSE4_NAME)
  end

  def self.infinity_script
    Script.get_from_cache(Script::INFINITY_NAME)
  end

  def self.flappy_script
    Script.get_from_cache(Script::FLAPPY_NAME)
  end

  def self.playlab_script
    Script.get_from_cache(Script::PLAYLAB_NAME)
  end

  def self.artist_script
    Script.get_from_cache(Script::ARTIST_NAME)
  end

  def self.lesson_extras_script_ids
    @@lesson_extras_scripts ||= Script.all.select(&:lesson_extras_available?).pluck(:id)
  end

  def self.maker_unit_scripts
    visible_scripts.select {|s| s.family_name == 'csd6'}
  end

  # Get the set of scripts that are valid for the current user, ignoring those
  # that are hidden based on the user's permission.
  # @param [User] user
  # @return [Script[]]
  def self.valid_scripts(user)
    has_any_course_experiments = UnitGroup.has_any_course_experiments?(user)
    with_hidden = !has_any_course_experiments && user.hidden_script_access?
    scripts = with_hidden ? all_scripts : visible_scripts

    if has_any_course_experiments
      scripts = scripts.map do |script|
        alternate_script = script.alternate_script(user)
        alternate_script.presence || script
      end
    end

    if !with_hidden && has_any_pilot_access?(user)
      scripts += all_scripts.select {|s| s.has_pilot_access?(user)}
    end

    scripts
  end

  class << self
    def all_scripts
      all_scripts = Rails.cache.fetch('valid_scripts/all') do
        Script.all.to_a
      end
      all_scripts.freeze
    end

    private

    def visible_scripts
      visible_scripts = Rails.cache.fetch('valid_scripts/valid') do
        Script.all.reject(&:hidden).to_a
      end
      visible_scripts.freeze
    end
  end

  # @param user [User]
  # @returns [Boolean] Whether the user can assign this script.
  # Users should only be able to assign one of their valid scripts.
  def assignable?(user)
    if user&.teacher?
      Script.valid_script_id?(user, id)
    end
  end

  # @param [User] user
  # @param script_id [String] id of the script we're checking the validity of
  # @return [Boolean] Whether this is a valid script ID
  def self.valid_script_id?(user, script_id)
    valid_scripts(user).any? {|script| script[:id] == script_id.to_i}
  end

  # @return [Array<Script>] An array of modern elementary scripts.
  def self.modern_elementary_courses
    Script::CATEGORIES[:csf].map {|name| Script.get_from_cache(name)}
  end

  # @param locale [String] An "xx-YY" locale string.
  # @return [Boolean] Whether all the modern elementary courses are available in the given locale.
  def self.modern_elementary_courses_available?(locale)
    @modern_elementary_courses_available = modern_elementary_courses.all? do |script|
      supported_languages = script.supported_locales || []
      supported_languages.any? {|s| locale.casecmp?(s)}
    end
  end

  def starting_level
    raise "Script #{name} has no level to start at" if script_levels.empty?
    candidate_level = script_levels.first.or_next_progression_level
    raise "Script #{name} has no valid progression levels (non-unplugged) to start at" unless candidate_level
    candidate_level
  end

  # Find the lesson based on its relative position, lockable value, and if it has a lesson plan.
  # Raises `ActiveRecord::RecordNotFound` if no matching lesson is found.
  def lesson_by_relative_position(position, unnumbered_lesson = false)
    if unnumbered_lesson
      lessons.where(lockable: true, has_lesson_plan: false).find_by!(relative_position: position)
    else
      lessons.where(lockable: false).or(lessons.where(has_lesson_plan: true)).find_by!(relative_position: position)
    end
  end

  # For all scripts, cache all related information (levels, etc),
  # indexed by both id and name. This is cached both in a class
  # variable (ie. in memory in the worker process) and in a
  # distributed cache (Rails.cache)
  @@script_cache = nil
  SCRIPT_CACHE_KEY = 'script-cache'.freeze

  # Caching is disabled when editing scripts and levels or running unit tests.
  def self.should_cache?
    return false if Rails.application.config.levelbuilder_mode
    return false unless Rails.application.config.cache_classes
    return false if ENV['UNIT_TEST'] || ENV['CI']
    true
  end

  def self.script_cache_to_cache
    Rails.cache.write(SCRIPT_CACHE_KEY, script_cache_from_db)
  end

  def self.script_cache_from_cache
    [
      ScriptLevel, Level, Game, Concept, Callout, Video, Artist, Blockly, UnitGroupUnit
    ].each(&:new) # make sure all possible loaded objects are completely loaded
    Rails.cache.read SCRIPT_CACHE_KEY
  end

  def self.script_cache_from_db
    {}.tap do |cache|
      Script.with_associated_models.find_each do |script|
        cache[script.name] = script
        cache[script.id.to_s] = script
      end
    end
  end

  def self.script_cache
    return nil unless should_cache?
    @@script_cache ||=
      script_cache_from_cache || script_cache_from_db
  end

  # Returns a cached map from script level id to script_level, or nil if in level_builder mode
  # which disables caching.
  def self.script_level_cache
    return nil unless should_cache?
    @@script_level_cache ||= {}.tap do |cache|
      script_cache.values.each do |script|
        cache.merge!(script.script_levels.index_by(&:id))
      end
    end
  end

  # Returns a cached map from level id and level name to level, or nil if in
  # level_builder mode which disables caching.
  def self.level_cache
    return nil unless should_cache?
    @@level_cache ||= {}.tap do |cache|
      script_level_cache.values.each do |script_level|
        level = script_level.level
        next unless level
        cache[level.id] = level unless cache.key? level.id
        cache[level.name] = level unless cache.key? level.name
      end
    end
  end

  # Returns a cached map from family_name to scripts, or nil if caching is disabled.
  def self.script_family_cache
    return nil unless should_cache?
    @@script_family_cache ||= {}.tap do |cache|
      family_scripts = script_cache.values.group_by(&:family_name)
      # Not all scripts have a family_name, and thus will be grouped as family_scripts[nil].
      # We do not want to store this key-value pair in the cache.
      family_scripts.delete(nil)
      cache.merge!(family_scripts)
    end
  end

  # Find the script level with the given id from the cache, unless the level build mode
  # is enabled in which case it is always fetched from the database. If we need to fetch
  # the script and we're not in level mode (for example because the script was created after
  # the cache), then an entry for the script is added to the cache.
  def self.cache_find_script_level(script_level_id)
    script_level = script_level_cache[script_level_id] if should_cache?

    # If the cache missed or we're in levelbuilder mode, fetch the script level from the db.
    if script_level.nil?
      script_level = ScriptLevel.find(script_level_id)
      # Cache the script level, unless it wasn't found.
      @@script_level_cache[script_level_id] = script_level if script_level && should_cache?
    end
    script_level
  end

  # Find the level with the given id or name from the cache, unless the level
  # build mode is enabled in which case it is always fetched from the database.
  # If we need to fetch the level and we're not in level mode (for example
  # because the level was created after the cache), then an entry for the level
  # is added to the cache.
  # @param level_identifier [Integer | String] the level ID or level name to
  #   fetch
  # @return [Level] the (possibly cached) level
  # @raises [ActiveRecord::RecordNotFound] if the level cannot be found
  def self.cache_find_level(level_identifier)
    level = level_cache[level_identifier] if should_cache?
    return level unless level.nil?

    # If the cache missed or we're in levelbuilder mode, fetch the level from
    # the db. Note the field trickery is to allow passing an ID as a string,
    # which some tests rely on (unsure about non-tests).
    field = level_identifier.to_i.to_s == level_identifier.to_s ? :id : :name
    level = Level.find_by!(field => level_identifier)
    # Cache the level by ID and by name, unless it wasn't found.
    @@level_cache[level.id] = level if level && should_cache?
    @@level_cache[level.name] = level if level && should_cache?
    level
  rescue => e
    raise e, "Error finding level #{level_identifier}: #{e}"
  end

  def cached
    return self unless Script.should_cache?
    self.class.get_from_cache(id)
  end

  def self.get_without_cache(id_or_name, with_associated_models: true)
    # Also serve any script by its new_name, if it has one.
    script = id_or_name && Script.find_by(new_name: id_or_name)
    return script if script

    # a bit of trickery so we support both ids which are numbers and
    # names which are strings that may contain numbers (eg. 2-3)
    is_id = id_or_name.to_i.to_s == id_or_name.to_s
    find_by = is_id ? :id : :name
    script_model = with_associated_models ? Script.with_associated_models : Script
    script = script_model.find_by(find_by => id_or_name)
    return script if script

    raise ActiveRecord::RecordNotFound.new("Couldn't find Script with id|name=#{id_or_name}")
  end

  # Returns the script with the specified id, or a script with the specified
  # name. Also populates the script cache so that future responses will be cached.
  # For example:
  #   get_from_cache('11') --> script_cache['11'] = <Script id=11, name=...>
  #   get_from_cache('frozen') --> script_cache['frozen'] = <Script name="frozen", id=...>
  #
  # @param id_or_name [String|Integer] script id, script name, or script family name.
  def self.get_from_cache(id_or_name)
    if ScriptConstants::FAMILY_NAMES.include?(id_or_name)
      raise "Do not call Script.get_from_cache with a family_name. Call Script.get_script_family_redirect_for_user instead.  Family: #{id_or_name}"
    end

    return get_without_cache(id_or_name, with_associated_models: false) unless should_cache?
    cache_key = id_or_name.to_s
    script_cache.fetch(cache_key) do
      # Populate cache on miss.
      script_cache[cache_key] = get_without_cache(id_or_name)
    end
  end

  def self.get_family_without_cache(family_name)
    Script.where(family_name: family_name).order("properties -> '$.version_year' DESC")
  end

  # Returns all scripts within a family from the Rails cache.
  # Populates the cache with scripts in that family upon cache miss.
  # @param family_name [String] Family name for the desired scripts.
  # @return [Array<Script>] Scripts within the specified family.
  def self.get_family_from_cache(family_name)
    return Script.get_family_without_cache(family_name) unless should_cache?

    script_family_cache.fetch(family_name) do
      # Populate cache on miss.
      script_family_cache[family_name] = Script.get_family_without_cache(family_name)
    end
  end

  def self.remove_from_cache(script_name)
    script_cache.delete(script_name) if script_cache
  end

  def self.get_script_family_redirect_for_user(family_name, user: nil, locale: 'en-US')
    return nil unless family_name

    family_scripts = Script.get_family_from_cache(family_name).sort_by(&:version_year).reverse

    # Only students should be redirected based on script progress and/or section assignments.
    if user&.student?
      assigned_script_ids = user.section_scripts.pluck(:id)
      progress_script_ids = user.user_levels.map(&:script_id)
      script_ids = assigned_script_ids.concat(progress_script_ids).compact.uniq
      script_name = family_scripts.select {|s| script_ids.include?(s.id)}&.first&.name
      return Script.new(redirect_to: script_name) if script_name
    end

    locale_str = locale&.to_s
    latest_version = nil
    family_scripts.each do |script|
      next unless script.is_stable
      latest_version ||= script

      # All English-speaking locales are supported, so we check that the locale starts with 'en' rather
      # than matching en-US specifically.
      is_supported = script.supported_locales&.include?(locale_str) || locale_str&.downcase&.start_with?('en')
      if is_supported
        latest_version = script
        break
      end
    end

    script_name = latest_version&.name
    script_name ? Script.new(redirect_to: script_name) : nil
  end

  def self.log_redirect(old_script_name, new_script_name, request, event_name, user_type)
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'script-family-redirect',
        event: event_name,
        data_string: request.path,
        data_json: {
          old_script_name: old_script_name,
          new_script_name: new_script_name,
          method: request.method,
          url: request.url,
          referer: request.referer,
          user_type: user_type
        }.to_json
      }
    )
  end

  # @param user [User]
  # @param locale [String] User or request locale. Optional.
  # @return [String|nil] URL to the script overview page the user should be redirected to (if any).
  def redirect_to_script_url(user, locale: nil)
    # No redirect unless script belongs to a family.
    return nil unless family_name
    # Only redirect students.
    return nil unless user && user.student?
    # No redirect unless user is allowed to view this script version and they are not already assigned to this script
    # or the course it belongs to.
    return nil unless can_view_version?(user, locale: locale) && !user.assigned_script?(self)
    # No redirect if script or its course are not versioned.
    current_version_year = version_year || unit_group&.version_year
    return nil unless current_version_year.present?

    # Redirect user to the latest assigned script in this family,
    # if one exists and it is newer than the current script.
    latest_assigned_version = Script.latest_assigned_version(family_name, user)
    latest_assigned_version_year = latest_assigned_version&.version_year || latest_assigned_version&.unit_group&.version_year
    return nil unless latest_assigned_version_year && latest_assigned_version_year > current_version_year
    latest_assigned_version.link
  end

  def link
    Rails.application.routes.url_helpers.script_path(self)
  end

  # @param user [User]
  # @param locale [String] User or request locale. Optional.
  # @return [Boolean] Whether the user can view the script.
  def can_view_version?(user, locale: nil)
    # Users can view any course not in a family.
    return true unless family_name

    latest_stable_version = Script.latest_stable_version(family_name)
    latest_stable_version_in_locale = Script.latest_stable_version(family_name, locale: locale)
    is_latest = latest_stable_version == self || latest_stable_version_in_locale == self

    # All users can see the latest script version in English and in their locale.
    return true if is_latest

    # Restrictions only apply to students and logged out users.
    return false if user.nil?
    return true unless user.student?

    # A student can view the script version if they have progress in it or the course it belongs to.
    has_progress = user.scripts.include?(self) || unit_group&.has_progress?(user)
    return true if has_progress

    # A student can view the script version if they are assigned to it.
    user.assigned_script?(self)
  end

  # @param family_name [String] The family name for a script family.
  # @param version_year [String] Version year to return. Optional.
  # @param locale [String] User or request locale. Optional.
  # @return [Script|nil] Returns the latest version in a script family.
  def self.latest_stable_version(family_name, version_year: nil, locale: 'en-us')
    return nil unless family_name.present?

    script_versions = Script.get_family_from_cache(family_name).
      sort_by(&:version_year).reverse

    # Only select stable, supported scripts (ignore supported locales if locale is an English-speaking locale).
    # Match on version year if one is supplied.
    locale_str = locale&.to_s
    supported_stable_scripts = script_versions.select do |script|
      is_supported = script.supported_locales&.include?(locale_str) || locale_str&.start_with?('en')
      if version_year
        script.is_stable && is_supported && script.version_year == version_year
      else
        script.is_stable && is_supported
      end
    end

    supported_stable_scripts&.first
  end

  # @param family_name [String] The family name for a script family.
  # @param user [User]
  # @return [Script|nil] Returns the latest version in a family that the user is assigned to.
  def self.latest_assigned_version(family_name, user)
    return nil unless family_name && user
    assigned_script_ids = user.section_scripts.pluck(:id)

    Script.
      # select only scripts assigned to this user.
      where(id: assigned_script_ids).
      # select only scripts in the same family.
      where(family_name: family_name).
      # order by version year descending.
      order("properties -> '$.version_year' DESC")&.
      first
  end

  def text_response_levels
    return @text_response_levels if Script.should_cache? && @text_response_levels
    @text_response_levels = text_response_levels_without_cache
  end

  def text_response_levels_without_cache
    text_response_levels = []
    script_levels.map do |script_level|
      script_level.levels.map do |level|
        next if level.contained_levels.empty? ||
          !TEXT_RESPONSE_TYPES.include?(level.contained_levels.first.class)
        text_response_levels << {
          script_level: script_level,
          levels: [level.contained_levels.first]
        }
      end
    end

    text_response_levels.concat(
      script_levels.includes(:levels).
        where('levels.type' => TEXT_RESPONSE_TYPES).
        map do |script_level|
          {
            script_level: script_level,
            levels: script_level.levels
          }
        end
    )

    text_response_levels
  end

  def to_param
    name
  end

  # Legacy levels have different video and title logic in LevelsHelper.
  def legacy_curriculum?
    [TWENTY_HOUR_NAME, HOC_2013_NAME, EDIT_CODE_NAME, TWENTY_FOURTEEN_NAME, FLAPPY_NAME, JIGSAW_NAME].include? name
  end

  def twenty_hour?
    ScriptConstants.script_in_category?(:twenty_hour, name)
  end

  def hoc?
    ScriptConstants.script_in_category?(:hoc, name)
  end

  def flappy?
    ScriptConstants.script_in_category?(:flappy, name)
  end

  def minecraft?
    ScriptConstants.script_in_category?(:minecraft, name)
  end

  def k5_draft_course?
    ScriptConstants.script_in_category?(:csf2_draft, name)
  end

  def csf_international?
    ScriptConstants.script_in_category?(:csf_international, name)
  end

  def self.script_names_by_curriculum_umbrella(curriculum_umbrella)
    Script.where("properties -> '$.curriculum_umbrella' = ?", curriculum_umbrella).pluck(:name)
  end

  def self.scripts_with_standards
    Script.
      where("properties -> '$.curriculum_umbrella' = 'CSF'").
      where("properties -> '$.version_year' >= '2019'").
      map {|script| [script.title_for_display, script.name]}
  end

  def has_standards_associations?
    curriculum_umbrella == 'CSF' && version_year && version_year >= '2019'
  end

  def standards
    standards = lessons.map(&:standards).flatten.uniq
    standards_with_lessons = []
    standards.each do |standard|
      standard_summary = standard.summarize
      lessons_by_standard = lessons & standard.lessons
      standard_summary[:lesson_ids] = lessons_by_standard.pluck(:id)
      standards_with_lessons << standard_summary
    end
    standards_with_lessons
  end

  def under_curriculum_umbrella?(specific_curriculum_umbrella)
    curriculum_umbrella == specific_curriculum_umbrella
  end

  def k5_course?
    return false if twenty_hour?
    csf?
  end

  def csf?
    under_curriculum_umbrella?('CSF')
  end

  def csd?
    under_curriculum_umbrella?('CSD')
  end

  def csp?
    under_curriculum_umbrella?('CSP')
  end

  def cs_in_a?
    name.match(Regexp.union('algebra', 'Algebra'))
  end

  def k1?
    [
      Script::COURSEA_DRAFT_NAME,
      Script::COURSEB_DRAFT_NAME,
      Script::COURSEA_NAME,
      Script::COURSEB_NAME,
      Script::COURSE1_NAME
    ].include?(name)
  end

  def localize_long_instructions?
    # Don't ever show non-English markdown instructions for Course 1 - 4, the
    # 20-hour course, or the pre-2017 minecraft courses.
    !(
      csf_international? ||
      twenty_hour? ||
      [
        ScriptConstants::MINECRAFT_NAME,
        ScriptConstants::MINECRAFT_DESIGNER_NAME
      ].include?(name)
    )
  end

  def beta?
    Script.beta? name
  end

  def self.beta?(name)
    name == Script::EDIT_CODE_NAME || ScriptConstants.script_in_category?(:csf2_draft, name)
  end

  def get_script_level_by_id(script_level_id)
    script_levels.find(id: script_level_id.to_i)
  end

  def get_script_level_by_relative_position_and_puzzle_position(relative_position, puzzle_position, unnumbered_lesson)
    relative_position ||= 1
    script_levels.find do |sl|
      # make sure we are checking the native properties of the script level
      # first, so we only have to load lesson if it's actually necessary.
      sl.position == puzzle_position.to_i &&
        !sl.bonus &&
        sl.lesson.relative_position == relative_position.to_i &&
        (unnumbered_lesson == !sl.lesson.numbered_lesson?)
    end
  end

  def get_script_level_by_chapter(chapter)
    chapter = chapter.to_i
    return nil if chapter < 1 || chapter > script_levels.to_a.size
    script_levels[chapter - 1] # order is by chapter
  end

  def get_bonus_script_levels(current_stage, current_user)
    unless @all_bonus_script_levels
      @all_bonus_script_levels = lessons.map do |stage|
        {
          stageNumber: stage.relative_position,
          levels: stage.script_levels.select(&:bonus).map {|bonus_level| bonus_level.summarize_as_bonus(current_user&.id)}
        }
      end
      @all_bonus_script_levels.select! {|stage| stage[:levels].any?}
    end

    @all_bonus_script_levels.select {|stage| stage[:stageNumber] <= current_stage.absolute_position}
  end

  def text_to_speech_enabled?
    tts?
  end

  # Generates TTS files for each level in a script.
  def tts_update
    levels.each(&:tts_update)
  end

  def hint_prompt_enabled?
    csf?
  end

  def hide_solutions?
    name == 'algebra'
  end

  def banner_image
    if has_banner?
      "banner_#{name}.jpg"
    end
  end

  def has_banner?
    # Temporarily remove Course A-F banner (wrong size) - Josh L.
    return true if csf_international?
    return false if csf?

    [
      Script::CSP17_UNIT1_NAME,
      Script::CSP17_UNIT2_NAME,
      Script::CSP17_UNIT3_NAME,
      Script::CSP_UNIT1_NAME,
      Script::CSP_UNIT2_NAME,
      Script::CSP_UNIT3_NAME,
    ].include?(name)
  end

  def has_peer_reviews?
    peer_reviews_to_complete.try(:>, 0)
  end

  # Is age 13+ required for logged out users
  # @return {bool}
  def logged_out_age_13_required?
    return false if login_required

    # hard code some exceptions. ideally we'd get rid of these and just make our
    # UI tests deal with the 13+ requirement
    return false if %w(allthethings allthehiddenthings allthettsthings).include?(name)

    script_levels.any? {|script_level| script_level.levels.any?(&:age_13_required?)}
  end

  # @param user [User]
  # @return [Boolean] Whether the user has progress on another version of this script.
  def has_older_version_progress?(user)
    return nil unless user && family_name && version_year
    user_script_ids = user.user_scripts.pluck(:script_id)

    Script.
      # select only scripts in the same script family.
      where(family_name: family_name).
      # select only older versions.
      where("properties -> '$.version_year' < ?", version_year).
      # exclude the current script.
      where.not(id: id).
      # select only scripts which the user has progress in.
      where(id: user_script_ids).
      count > 0
  end

  # Create or update any scripts, script levels and lessons specified in the
  # script file definitions. If new_suffix is specified, create a copy of the
  # script and any associated levels, appending new_suffix to the name when
  # copying. Any new_properties are merged into the properties of the new script.
  def self.setup(custom_files, new_suffix: nil, new_properties: {}, show_progress: false)
    scripts_to_add = []

    custom_i18n = {}
    # Load custom scripts from Script DSL format
    custom_files.map do |script|
      name = File.basename(script, '.script')
      base_name = Script.base_name(name)
      name = "#{base_name}-#{new_suffix}" if new_suffix
      script_data, i18n =
        begin
          ScriptDSL.parse_file(script, name)
        rescue => e
          raise e, "Error parsing script file #{script}: #{e}"
        end

      lesson_groups = script_data[:lesson_groups]
      custom_i18n.deep_merge!(i18n)
      # TODO: below is duplicated in update_text. and maybe can be refactored to pass script_data?
      scripts_to_add << [{
        id: script_data[:id],
        name: name,
        hidden: script_data[:hidden].nil? ? true : script_data[:hidden], # default true
        login_required: script_data[:login_required].nil? ? false : script_data[:login_required], # default false
        wrapup_video: script_data[:wrapup_video],
        new_name: script_data[:new_name],
        family_name: script_data[:family_name],
        properties: Script.build_property_hash(script_data).merge(new_properties)
      }, lesson_groups]
    end

    progressbar = ProgressBar.create(total: scripts_to_add.length, format: '%t (%c/%C): |%B|') if show_progress

    # Stable sort by ID then add each script, ensuring scripts with no ID end up at the end
    added_script_names = scripts_to_add.sort_by.with_index {|args, idx| [args[0][:id] || Float::INFINITY, idx]}.map do |options, raw_lesson_groups|
      added_script =
        options[:properties][:is_migrated] == true ?
          seed_from_json_file(options[:name]) :
          add_script(options, raw_lesson_groups, new_suffix: new_suffix, editor_experiment: new_properties[:editor_experiment])
      progressbar.increment if show_progress
      added_script.name
    rescue => e
      raise e, "Error adding script named '#{options[:name]}': #{e}", e.backtrace
    end
    [added_script_names, custom_i18n]
  end

  # if new_suffix is specified, copy the script, hide it, and copy all its
  # levelbuilder-defined levels.
  def self.add_script(options, raw_lesson_groups, new_suffix: nil, editor_experiment: nil)
    transaction do
      script = fetch_script(options)
      script.update!(hidden: true) if new_suffix

      script.prevent_duplicate_lesson_groups(raw_lesson_groups)
      Script.prevent_some_lessons_in_lesson_groups_and_some_not(raw_lesson_groups)

      temp_lgs = LessonGroup.add_lesson_groups(raw_lesson_groups, script, new_suffix, editor_experiment)
      script.reload
      script.lesson_groups = temp_lgs
      script.save!

      script.generate_plc_objects

      CourseOffering.add_course_offering(script)

      script
    end
  end

  # If there is more than 1 lesson group then the key should never
  # be nil because this means some lessons are in a lesson group
  # and some are not
  def self.prevent_some_lessons_in_lesson_groups_and_some_not(raw_lesson_groups)
    return if raw_lesson_groups.length < 2

    raw_lesson_groups.each do |lesson_group|
      if lesson_group[:key].nil?
        raise "Expect if one lesson has a lesson group all lessons have lesson groups."
      end
    end
  end

  # Lesson groups can only show up once in a script
  def prevent_duplicate_lesson_groups(raw_lesson_groups)
    previous_lesson_groups = []
    raw_lesson_groups.each do |lesson_group|
      if previous_lesson_groups.include?(lesson_group[:key])
        raise "Duplicate Lesson Group. Lesson Group: #{lesson_group[:key]} is used twice in Script: #{name}."
      end
      previous_lesson_groups.append(lesson_group[:key])
    end
  end

  # Script levels unfortunately have 3 position values:
  # 1. chapter: position within the Script
  # 2. position: position within the Lesson
  # 3. activity_section_position: position within the ActivitySection.
  # This method uses activity_section_position as the source of truth to set the
  # values of position and chapter on all script levels in the script.
  def fix_script_level_positions
    reload
    if script_levels.reject(&:activity_section).any?
      raise "cannot fix position of legacy script levels"
    end

    chapter = 0
    lessons.each do |lesson|
      position = 0
      lesson.lesson_activities.each do |activity|
        activity.activity_sections.each do |section|
          section.script_levels.each do |sl|
            sl.chapter = (chapter += 1)
            sl.position = (position += 1)
            sl.save!
          end
        end
      end
    end
  end

  # Lessons unfortunately have 2 position values:
  # 1. absolute_position: position within the script (used to order lessons with in lesson groups in correct order)
  # 2. relative_position: position within the Script relative other numbered/unnumbered lessons
  # This method updates the position values for all lessons in a script after
  # a lesson is saved
  def fix_lesson_positions
    reload

    total_count = 1
    numbered_lesson_count = 1
    unnumbered_lesson_count = 1
    lessons.each do |lesson|
      lesson.absolute_position = total_count
      lesson.relative_position = lesson.numbered_lesson? ? numbered_lesson_count : unnumbered_lesson_count
      lesson.save!

      total_count += 1
      lesson.numbered_lesson? ? (numbered_lesson_count += 1) : (unnumbered_lesson_count += 1)
    end
  end

  # Clone this script, appending a dash and the suffix to the name of this
  # script. Also clone all the levels in the script, appending an underscore and
  # the suffix to the name of each level. Mark the new script as hidden, and
  # copy any translations and other metadata associated with the original script.
  # @param options [Hash] Optional properties to set on the new script.
  # @param options[:editor_experiment] [String] Optional editor_experiment name.
  #   if specified, this editor_experiment will also be applied to any newly
  #   created levels.
  def clone_with_suffix(new_suffix, options = {})
    new_name = "#{base_name}-#{new_suffix}"

    script_filename = "#{Script.script_directory}/#{name}.script"
    new_properties = {
      is_stable: false,
      tts: false,
      announcements: nil,
      is_course: false
    }.merge(options)
    if /^[0-9]{4}$/ =~ (new_suffix)
      new_properties[:version_year] = new_suffix
    end
    script_names, _ = Script.setup([script_filename], new_suffix: new_suffix, new_properties: new_properties)
    new_script = Script.find_by!(name: script_names.first)

    # Make sure we don't modify any files in unit tests.
    if Rails.application.config.levelbuilder_mode
      copy_and_write_i18n(new_name)
      new_filename = "#{Script.script_directory}/#{new_name}.script"
      ScriptDSL.serialize(new_script, new_filename)
    end

    new_script
  end

  def base_name
    Script.base_name(name)
  end

  def self.base_name(name)
    # strip existing year suffix, if there is one
    m = /^(.*)-([0-9]{4})$/.match(name)
    m ? m[1] : name
  end

  # Creates a copy of all translations associated with this script, and adds
  # them as translations for the script named new_name.
  def copy_and_write_i18n(new_name)
    scripts_yml = File.expand_path("#{Rails.root}/config/locales/scripts.en.yml")
    i18n = File.exist?(scripts_yml) ? YAML.load_file(scripts_yml) : {}
    i18n.deep_merge!(summarize_i18n_for_copy(new_name))
    File.write(scripts_yml, "# Autogenerated scripts locale file.\n" + i18n.to_yaml(line_width: -1))
  end

  # script is found/created by 'id' (if provided), or by 'new_name' (if provided
  # and found), otherwise by 'name'.
  #
  # Once a script's 'new_name' has been seeded into the database, the script file
  # can then be renamed back and forth between its old name and its new_name (or to
  # any other name), and the corresponding script row in the db will be renamed.
  def self.fetch_script(options)
    options.symbolize_keys!
    options[:wrapup_video] = options[:wrapup_video].blank? ? nil : Video.current_locale.find_by!(key: options[:wrapup_video])
    id = options.delete(:id)
    name = options[:name]
    new_name = options[:new_name]
    script =
      if id
        Script.with_default_fields.create_with(name: name).find_or_create_by({id: id})
      else
        (new_name && Script.with_default_fields.find_by({new_name: new_name})) ||
          Script.with_default_fields.find_or_create_by({name: name})
      end
    script.update!(options.merge(skip_name_format_validation: true))
    script
  end

  def self.with_default_fields
    Script.includes(:levels, :script_levels, lessons: :script_levels)
  end

  # Update strings and serialize changes to .script file
  def update_text(script_params, script_text, metadata_i18n, general_params)
    script_name = script_params[:name]
    begin
      script_data, i18n = ScriptDSL.parse(script_text, 'input', script_name)
      Script.add_script(
        {
          name: script_name,
          hidden: general_params[:hidden].nil? ? true : general_params[:hidden], # default true
          login_required: general_params[:login_required].nil? ? false : general_params[:login_required], # default false
          wrapup_video: general_params[:wrapup_video],
          family_name: general_params[:family_name].presence ? general_params[:family_name] : nil, # default nil
          properties: Script.build_property_hash(general_params)
        },
        script_data[:lesson_groups]
      )
      if Rails.application.config.levelbuilder_mode
        Script.merge_and_write_i18n(i18n, script_name, metadata_i18n)
      end
    rescue StandardError => e
      errors.add(:base, e.to_s)
      return false
    end
    update_teacher_resources(general_params[:resourceTypes], general_params[:resourceLinks])
    begin
      if Rails.application.config.levelbuilder_mode
        script = Script.find_by_name(script_name)
        # Save in our custom Script DSL format. This is still what we're using currently to sync data
        # across environments. The CPlat team is working on replacing it a new JSON-based approach.
        script.write_script_dsl

        # Also save in JSON format for "new seeding". This has not been launched yet, but as part of
        # pre-launch testing, we'll start generating these files in addition to the old .script files.
        script.write_script_json
      end
      true
    rescue StandardError => e
      errors.add(:base, e.to_s)
      return false
    end
  end

  def write_script_dsl
    script_dsl_filepath = "#{Rails.root}/config/scripts/#{name}.script"
    ScriptDSL.serialize(self, script_dsl_filepath)
  end

  def write_script_json
    filepath = Script.script_json_filepath(name)
    File.write(filepath, Services::ScriptSeed.serialize_seeding_json(self))
  end

  # @param types [Array<string>]
  # @param links [Array<string>]
  def update_teacher_resources(types, links)
    return if types.nil? || links.nil? || types.length != links.length
    # Only take those pairs in which we have both a type and a link
    resources = types.zip(links).select {|type, link| type.present? && link.present?}
    update!(
      {
        teacher_resources: resources,
        skip_name_format_validation: true
      }
    )
  end

  def self.rake
    # cf. http://stackoverflow.com/a/9943895
    require 'rake'
    Rake::Task.clear
    Dashboard::Application.load_tasks
    Rake::FileTask['config/scripts/.seeded'].invoke
  end

  # This method updates scripts.en.yml with i18n data from the scripts.
  # There are three types of i18n data
  # 1. Stage names, which we get from the script DSL, and is passed in as lessons_i18n here
  # 2. Script Metadata (title, descs, etc.) which is in metadata_i18n
  # 3. Stage descriptions, which arrive as JSON in metadata_i18n[:stage_descriptions]
  def self.merge_and_write_i18n(lessons_i18n, script_name = '', metadata_i18n = {})
    scripts_yml = File.expand_path("#{Rails.root}/config/locales/scripts.en.yml")
    i18n = File.exist?(scripts_yml) ? YAML.load_file(scripts_yml) : {}

    updated_i18n = update_i18n(i18n, lessons_i18n, script_name, metadata_i18n)
    File.write(scripts_yml, "# Autogenerated scripts locale file.\n" + updated_i18n.to_yaml(line_width: -1))
  end

  def self.update_i18n(existing_i18n, lessons_i18n, script_name = '', metadata_i18n = {})
    if metadata_i18n != {}
      stage_descriptions = metadata_i18n.delete(:stage_descriptions)
      metadata_i18n['lessons'] = {}
      unless stage_descriptions.nil?
        JSON.parse(stage_descriptions).each do |stage|
          stage_name = stage['name']
          stage_data = {
            'description_student' => stage['descriptionStudent'],
            'description_teacher' => stage['descriptionTeacher']
          }
          metadata_i18n['lessons'][stage_name] = stage_data
        end
      end
      metadata_i18n = {'en' => {'data' => {'script' => {'name' => {script_name => metadata_i18n.to_h}}}}}
    end

    lessons_i18n = {'en' => {'data' => {'script' => {'name' => lessons_i18n}}}}
    existing_i18n.deep_merge(lessons_i18n).deep_merge!(metadata_i18n)
  end

  def hoc_finish_url
    if name == Script::HOC_2013_NAME
      CDO.code_org_url '/api/hour/finish'
    else
      CDO.code_org_url "/api/hour/finish/#{name}"
    end
  end

  def csf_finish_url
    if name == Script::TWENTY_HOUR_NAME
      # Rename from 20-hour to public facing Accelerated
      CDO.code_org_url "/congrats/#{Script::ACCELERATED_NAME}"
    else
      CDO.code_org_url "/congrats/#{name}"
    end
  end

  def finish_url
    return hoc_finish_url if hoc?
    return csf_finish_url if csf?
    nil
  end

  def summarize(include_lessons = true, user = nil, include_bonus_levels = false)
    # TODO: Set up peer reviews to be more consistent with the rest of the system
    # so that they don't need a bunch of one off cases (example peer reviews
    # don't have a lesson group in the database right now)
    if has_peer_reviews?
      levels = []
      peer_reviews_to_complete.times do |x|
        levels << {
          ids: [x],
          kind: LEVEL_KIND.peer_review,
          title: '',
          url: '',
          name: I18n.t('peer_review.reviews_unavailable'),
          icon: 'fa-lock',
          locked: true
        }
      end

      peer_review_lesson_info = {
        name: I18n.t('peer_review.review_count', {review_count: peer_reviews_to_complete}),
        lesson_group_display_name: 'Peer Review',
        levels: levels,
        lockable: false
      }
    end

    has_older_course_progress = unit_group.try(:has_older_version_progress?, user)
    has_older_script_progress = has_older_version_progress?(user)
    user_script = user && user_scripts.find_by(user: user)

    # If the current user is assigned to this script, get the section
    # that assigned it.
    assigned_section_id = user&.assigned_script?(self) ? user.section_for_script(self)&.id : nil

    summary = {
      id: id,
      name: name,
      title: title_for_display,
      description: localized_description,
      studentDescription: localized_student_description,
      beta_title: Script.beta?(name) ? I18n.t('beta') : nil,
      course_id: unit_group.try(:id),
      hidden: hidden,
      is_stable: is_stable,
      loginRequired: login_required,
      plc: professional_learning_course?,
      hideable_lessons: hideable_lessons?,
      disablePostMilestone: disable_post_milestone?,
      isHocScript: hoc?,
      csf: csf?,
      peerReviewsRequired: peer_reviews_to_complete || 0,
      peerReviewLessonInfo: peer_review_lesson_info,
      student_detail_progress_view: student_detail_progress_view?,
      project_widget_visible: project_widget_visible?,
      project_widget_types: project_widget_types,
      teacher_resources: teacher_resources,
      lesson_extras_available: lesson_extras_available,
      has_verified_resources: has_verified_resources?,
      curriculum_path: curriculum_path,
      announcements: announcements,
      age_13_required: logged_out_age_13_required?,
      show_course_unit_version_warning: !unit_group&.has_dismissed_version_warning?(user) && has_older_course_progress,
      show_script_version_warning: !user_script&.version_warning_dismissed && !has_older_course_progress && has_older_script_progress,
      versions: summarize_versions(user),
      supported_locales: supported_locales,
      section_hidden_unit_info: section_hidden_unit_info(user),
      pilot_experiment: pilot_experiment,
      editor_experiment: editor_experiment,
      show_assign_button: assignable?(user),
      project_sharing: project_sharing,
      curriculum_umbrella: curriculum_umbrella,
      family_name: family_name,
      version_year: version_year,
      assigned_section_id: assigned_section_id,
      hasStandards: has_standards_associations?,
      tts: tts?,
      is_course: is_course?,
      background: background,
      is_migrated: is_migrated?,
      scriptPath: script_path(self),
      showCalendar: is_migrated ? show_calendar : false, #prevent calendar from showing for non-migrated scripts for now
      weeklyInstructionalMinutes: weekly_instructional_minutes
    }

    #TODO: lessons should be summarized through lesson groups in the future
    summary[:lessonGroups] = lesson_groups.map(&:summarize)

    # Filter out stages that have a visible_after date in the future
    filtered_lessons = lessons.select {|lesson| lesson.published?(user)}
    summary[:lessons] = filtered_lessons.map {|lesson| lesson.summarize(include_bonus_levels)} if include_lessons
    summary[:professionalLearningCourse] = professional_learning_course if professional_learning_course?
    summary[:wrapupVideo] = wrapup_video.key if wrapup_video

    summary
  end

  def summarize_for_script_edit
    include_lessons = false
    summary = summarize(include_lessons)
    summary[:lesson_groups] = lesson_groups.map(&:summarize_for_script_edit)
    summary[:lessonLevelData] = ScriptDSL.serialize_lesson_groups(self)
    summary
  end

  # @return {Hash<string,number[]>}
  #   For teachers, this will be a hash mapping from section id to a list of hidden
  #   script ids for that section, filtered so that the only script id which appears
  #   is the current script id. This mirrors the output format of
  #   User#get_hidden_script_ids, and satisfies the input format of
  #   initializeHiddenScripts in hiddenStageRedux.js.
  def section_hidden_unit_info(user)
    return {} unless user&.teacher?
    hidden_section_ids = SectionHiddenScript.where(script_id: id, section: user.sections).pluck(:section_id)
    hidden_section_ids.map {|section_id| [section_id, [id]]}.to_h
  end

  # Similar to summarize, but returns an even more narrow set of fields, restricted
  # to those needed in header.html.haml
  def summarize_header
    {
      name: name,
      disablePostMilestone: disable_post_milestone?,
      isHocScript: hoc?,
      student_detail_progress_view: student_detail_progress_view?,
      age_13_required: logged_out_age_13_required?
    }
  end

  def summarize_for_lesson_show
    {
      displayName: localized_title,
      link: link,
      lessons: lessons.select(&:has_lesson_plan).map(&:summarize_for_lesson_dropdown)
    }
  end

  # Creates an object representing all translations associated with this script
  # and its lessons, in a format that can be deep-merged with the contents of
  # scripts.en.yml.
  def summarize_i18n_for_copy(new_name)
    data = %w(title description student_description description_short description_audience).map do |key|
      [key, I18n.t("data.script.name.#{name}.#{key}", default: '')]
    end.to_h

    data['lessons'] = {}
    lessons.each do |lesson|
      lesson_data = {
        'key' => lesson.key,
        'name' => lesson.name,
        'description_student' => (I18n.t "data.script.name.#{name}.lessons.#{lesson.key}.description_student", default: ''),
        'description_teacher' => (I18n.t "data.script.name.#{name}.lessons.#{lesson.key}.description_teacher", default: '')
      }
      data['lessons'][lesson.key] = lesson_data
    end

    {'en' => {'data' => {'script' => {'name' => {new_name => data}}}}}
  end

  def summarize_i18n_for_edit(include_lessons=true)
    data = %w(title description student_description description_short description_audience).map do |key|
      [key.camelize(:lower).to_sym, I18n.t("data.script.name.#{name}.#{key}", default: '')]
    end.to_h

    if include_lessons
      data[:stageDescriptions] = lessons.map do |lesson|
        {
          key: lesson.key,
          name: lesson.name,
          descriptionStudent: (I18n.t "data.script.name.#{name}.lessons.#{lesson.key}.description_student", default: ''),
          descriptionTeacher: (I18n.t "data.script.name.#{name}.lessons.#{lesson.key}.description_teacher", default: '')
        }
      end
    end
    data
  end

  def summarize_i18n_for_display(include_lessons=true)
    data = summarize_i18n_for_edit(include_lessons)
    data[:title] = title_for_display
    data
  end

  # Returns an array of objects showing the name and version year for all scripts
  # sharing the family_name of this course, including this one.
  def summarize_versions(user = nil)
    return [] unless family_name
    return [] unless unit_groups.empty?
    with_hidden = user&.hidden_script_access?
    scripts = Script.
      where(family_name: family_name).
      all.
      select {|script| with_hidden || !script.hidden}.
      map do |s|
        {
          name: s.name,
          version_year: s.version_year,
          version_title: s.version_year,
          can_view_version: s.can_view_version?(user),
          is_stable: s.is_stable,
          locales: s.supported_locale_names
        }
      end

    scripts.sort_by {|info| info[:version_year]}.reverse
  end

  def self.clear_cache
    raise "only call this in a test!" unless Rails.env.test?
    @@script_cache = nil
    @@script_family_cache = nil
    @@level_cache = nil
    Rails.cache.delete SCRIPT_CACHE_KEY
  end

  def localized_title
    I18n.t "data.script.name.#{name}.title"
  end

  def title_for_display
    title = localized_title
    has_prefix = unit_group&.has_numbered_units
    return title unless has_prefix

    position = unit_group_units&.first&.position
    prefix = I18n.t "unit_prefix", n: position
    "#{prefix} - #{title}"
  end

  def localized_assignment_family_title
    I18n.t("data.script.name.#{name}.assignment_family_title", default: title_for_display)
  end

  def localized_description
    I18n.t "data.script.name.#{name}.description"
  end

  def localized_student_description
    I18n.t "data.script.name.#{name}.student_description"
  end

  def disable_post_milestone?
    !Gatekeeper.allows('postMilestone', where: {script_name: name}, default: true)
  end

  # Returns a property hash that always has the same keys, even if those keys were missing
  # from the input. This ensures that values can be un-set via seeding or the script edit UI.
  def self.build_property_hash(script_data)
    # When adding a key, add it to the appropriate list based on whether you want it defaulted to nil or false.
    # The existing keys in this list may not all be in the right place theoretically, but when adding a new key,
    # try to put it in the appropriate place.
    nonboolean_keys = [
      :hideable_lessons,
      :professional_learning_course,
      :peer_reviews_to_complete,
      :student_detail_progress_view,
      :project_widget_visible,
      :project_widget_types,
      :lesson_extras_available,
      :curriculum_path,
      :announcements,
      :version_year,
      :supported_locales,
      :pilot_experiment,
      :editor_experiment,
      :curriculum_umbrella,
      :background,
      :weekly_instructional_minutes,
    ]
    boolean_keys = [
      :has_verified_resources,
      :is_stable,
      :project_sharing,
      :tts,
      :is_course,
      :show_calendar,
      :is_migrated
    ]
    not_defaulted_keys = [
      :teacher_resources, # teacher_resources gets updated from the script edit UI through its own code path
    ]

    result = {}
    # If a non-boolean prop was missing from the input, it'll get populated in the result hash as nil.
    nonboolean_keys.each {|k| result[k] = script_data[k]}
    # If a boolean prop was missing from the input, it'll get populated in the result hash as false.
    boolean_keys.each {|k| result[k] = !!script_data[k]}
    not_defaulted_keys.each {|k| result[k] = script_data[k] if script_data.keys.include?(k)}

    result
  end

  # A script is considered to have a matching course if there is exactly one
  # course for this script
  def unit_group
    return nil if unit_group_units.length != 1
    UnitGroup.get_from_cache(unit_group_units[0].course_id)
  end

  # If this unit is a standalone course, returns its CourseVersion. Otherwise,
  # if this unit belongs to a UnitGroup, returns the UnitGroup's CourseVersion,
  # if there is one.
  # @return [CourseVersion]
  def get_course_version
    course_version || unit_group&.course_version
  end

  # @return {String|nil} path to the course overview page for this script if there
  #   is one.
  def course_link(section_id = nil)
    return nil unless unit_group
    path = course_path(unit_group)
    path += "?section_id=#{section_id}" if section_id
    path
  end

  def course_title
    unit_group.try(:localized_title)
  end

  # If there is an alternate version of this script which the user should be on
  # due to existing progress or a course experiment, return that script. Otherwise,
  # return nil.
  def alternate_script(user)
    unit_group_units.each do |ugu|
      alternate_ugu = ugu.unit_group.select_unit_group_unit(user, ugu)
      return alternate_ugu.script if ugu != alternate_ugu
    end
    nil
  end

  # @return {AssignableInfo} with strings translated
  def assignable_info
    info = ScriptConstants.assignable_info(self)
    info[:name] = I18n.t("data.script.name.#{info[:name]}.title", default: info[:name])
    info[:name] += " *" if hidden

    if family_name
      info[:assignment_family_name] = family_name
      info[:assignment_family_title] = localized_assignment_family_title
    end
    if version_year
      info[:version_year] = version_year
      # No need to localize version_title yet, since we only display it for CSF
      # scripts, which just use version_year.
      info[:version_title] = version_year
    end
    if localized_description
      info[:description] = localized_description
    end

    if localized_student_description
      info[:student_description] = localized_student_description
    end

    info[:is_stable] = true if is_stable

    info[:category] = I18n.t("data.script.category.#{info[:category]}_category_name", default: info[:category])
    info[:supported_locales] = supported_locale_names
    info[:lesson_extras_available] = lesson_extras_available
    if has_standards_associations?
      info[:standards] = standards
    end
    info
  end

  def supported_locale_names
    locales = supported_locales || []
    locales += ['en-US']
    locales = locales.sort
    locales.map {|l| Script.locale_native_name_map[l] || l}.uniq
  end

  def self.locale_native_name_map
    @@locale_native_name_map ||=
      PEGASUS_DB[:cdo_languages].
        select(:locale_s, :native_name_s).
        map {|row| [row[:locale_s], row[:native_name_s]]}.
        to_h
  end

  def self.locale_english_name_map
    @@locale_english_name_map ||=
      PEGASUS_DB[:cdo_languages].
        select(:locale_s, :english_name_s).
        map {|row| [row[:locale_s], row[:english_name_s]]}.
        to_h
  end

  # Get all script levels that are level groups, and return a list of those that are
  # not anonymous assessments.
  def get_assessment_script_levels
    script_levels.select do |sl|
      sl.levels.first.is_a?(LevelGroup) && sl.long_assessment? && !sl.anonymous?
    end
  end

  def get_feedback_for_section(section)
    rubric_performance_headers = {
      performanceLevel1: "Extensive Evidence",
      performanceLevel2: "Convincing Evidence",
      performanceLevel3: "Limited Evidence",
      performanceLevel4: "No Evidence"
    }

    rubric_performance_json_to_ruby = {
      performanceLevel1: "rubric_performance_level_1",
      performanceLevel2: "rubric_performance_level_2",
      performanceLevel3: "rubric_performance_level_3",
      performanceLevel4: "rubric_performance_level_4"
    }

    feedback = {}

    level_ids = script_levels.map(&:oldest_active_level).select(&:can_have_feedback?).map(&:id)
    student_ids = section.students.map(&:id)
    all_feedback = TeacherFeedback.get_all_feedback_for_section(student_ids, level_ids, section.user_id)

    feedback_hash = {}
    all_feedback.each do |feedback_element|
      feedback_hash[feedback_element.student_id] ||= {}
      feedback_hash[feedback_element.student_id][feedback_element.level_id] = feedback_element
    end

    script_levels.each do |script_level|
      next unless script_level.oldest_active_level.can_have_feedback?
      section.students.each do |student|
        current_level = script_level.oldest_active_level
        next unless feedback_hash[student.id]
        temp_feedback = feedback_hash[student.id][current_level.id]
        next unless temp_feedback
        feedback[temp_feedback.id] = {
          studentName: student.name,
          stageNum: script_level.lesson.relative_position.to_s,
          stageName: script_level.lesson.localized_title,
          levelNum: script_level.position.to_s,
          keyConcept: (current_level.rubric_key_concept || ''),
          performanceLevelDetails: (current_level.properties[rubric_performance_json_to_ruby[temp_feedback.performance&.to_sym]] || ''),
          performance: rubric_performance_headers[temp_feedback.performance&.to_sym],
          comment: temp_feedback.comment,
          timestamp: temp_feedback.updated_at.localtime.strftime("%D at %r")
        }
      end
    end

    return feedback
  end

  def pilot?
    !!pilot_experiment
  end

  def has_pilot_access?(user = nil)
    return false unless pilot? && user
    return true if user.permission?(UserPermission::LEVELBUILDER)
    return true if has_pilot_experiment?(user)
    # a platformization partner should be able to view pilot scripts which they
    # own, even if they are not in the pilot experiment.
    return true if has_editor_experiment?(user)

    # A user without the experiment has pilot script access if
    # (1) they have been assigned to or have progress in the pilot script, and
    # (2) one of their teachers has the pilot experiment enabled.
    has_progress = !!UserScript.find_by(user: user, script: self)
    has_progress && user.teachers.any? {|t| has_pilot_experiment?(t)}
  end

  # Whether this particular user has the pilot experiment enabled.
  def has_pilot_experiment?(user)
    return false unless pilot_experiment
    SingleUserExperiment.enabled?(user: user, experiment_name: pilot_experiment)
  end

  # returns true if the user is a levelbuilder, or a teacher with any pilot
  # script experiments enabled.
  def self.has_any_pilot_access?(user = nil)
    return false unless user&.teacher?
    return true if user.permission?(UserPermission::LEVELBUILDER)
    all_scripts.any? {|script| script.has_pilot_experiment?(user)}
  end

  # If a user is in the editor experiment of this script, that indicates that
  # they are a platformization partner who owns this script.
  def has_editor_experiment?(user)
    return false unless editor_experiment
    SingleUserExperiment.enabled?(user: user, experiment_name: editor_experiment)
  end

  def self.get_version_year_options
    UnitGroup.get_version_year_options
  end

  def all_descendant_levels
    sublevels = levels.map(&:all_descendant_levels).flatten
    levels + sublevels
  end

  # Used for seeding from JSON. Returns the full set of information needed to
  # uniquely identify this object as well as any other objects it belongs to.
  # If the attributes of this object alone aren't sufficient, and associated objects are needed, then data from
  # the seeding_keys of those objects should be included as well.
  # Ideally should correspond to a unique index for this model's table.
  # See comments on ScriptSeed.seed_from_hash for more context.
  #
  # @param [ScriptSeed::SeedContext] seed_context - contains preloaded data to use when looking up associated objects
  # @return [Hash<String, String>] all information needed to uniquely identify this object across environments.
  def seeding_key(seed_context)
    {'script.name': name}.stringify_keys
  end

  # Wrapper for convenience
  def serialize_seeding_json
    Services::ScriptSeed.serialize_seeding_json(self)
  end

  # @param [String] script_name - name of the script to seed from .script_json
  # @returns [Script] - the newly seeded script object
  def self.seed_from_json_file(script_name)
    filepath = script_json_filepath(script_name)
    Services::ScriptSeed.seed_from_json_file(filepath) if File.exist?(filepath)
  end

  def self.script_json_filepath(script_name)
    "#{script_json_directory}/#{script_name}.script_json"
  end
end

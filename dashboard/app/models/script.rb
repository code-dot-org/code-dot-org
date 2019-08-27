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

TEXT_RESPONSE_TYPES = [TextMatch, FreeResponse]

# A sequence of Levels
class Script < ActiveRecord::Base
  include ScriptConstants
  include SharedConstants
  include Rails.application.routes.url_helpers

  include Seeded
  has_many :levels, through: :script_levels
  has_many :script_levels, -> {order('chapter ASC')}, dependent: :destroy, inverse_of: :script # all script levels, even those w/ stages, are ordered by chapter, see Script#add_script
  has_many :stages, -> {order('absolute_position ASC')}, dependent: :destroy, inverse_of: :script
  has_many :users, through: :user_scripts
  has_many :user_scripts
  has_many :hint_view_requests
  has_one :plc_course_unit, class_name: 'Plc::CourseUnit', inverse_of: :script, dependent: :destroy
  belongs_to :wrapup_video, foreign_key: 'wrapup_video_id', class_name: 'Video'
  belongs_to :user
  has_many :course_scripts
  has_many :courses, through: :course_scripts

  scope :with_associated_models, -> do
    includes(
      [
        {
          script_levels: [
            {levels: [:game, :concepts, :level_concept_difficulty]},
            :stage,
            :callouts
          ]
        },
        {
          stages: [{script_levels: [:levels]}]
        },
        :course_scripts
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

  include SerializedProperties

  after_save :generate_plc_objects

  SCRIPT_DIRECTORY = 'config/scripts'.freeze

  def self.script_directory
    SCRIPT_DIRECTORY
  end

  def generate_plc_objects
    if professional_learning_course?
      course = Course.find_by_name(professional_learning_course)
      unless course
        course = Course.new(name: professional_learning_course)
        course.plc_course = Plc::Course.create!(course: course)
        course.save!
      end
      unit = Plc::CourseUnit.find_or_initialize_by(script_id: id)
      unit.update!(
        plc_course_id: course.plc_course.id,
        unit_name: I18n.t("data.script.name.#{name}.title"),
        unit_description: I18n.t("data.script.name.#{name}.description")
      )

      stages.reload
      stages.each do |stage|
        lm = Plc::LearningModule.find_or_initialize_by(stage_id: stage.id)
        lm.update!(
          plc_course_unit_id: unit.id,
          name: stage.name,
          module_type: stage.flex_category.try(:downcase) || Plc::LearningModule::REQUIRED_MODULE,
          plc_tasks: []
        )

        stage.script_levels.each do |sl|
          task = Plc::Task.find_or_initialize_by(script_level_id: sl.id)
          task.name = sl.level.name
          task.save!
          lm.plc_tasks << task
        end
      end
    end
  end

  serialized_attrs %w(
    hideable_stages
    peer_reviews_to_complete
    professional_learning_course
    redirect_to
    student_detail_progress_view
    project_widget_visible
    project_widget_types
    exclude_csf_column_in_legend
    teacher_resources
    stage_extras_available
    has_verified_resources
    has_lesson_plan
    curriculum_path
    script_announcements
    version_year
    is_stable
    supported_locales
    pilot_experiment
    editor_experiment
    project_sharing
    curriculum_umbrella
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

  def self.stage_extras_script_ids
    @@stage_extras_scripts ||= Script.all.select(&:stage_extras_available?).pluck(:id)
  end

  # Get the set of scripts that are valid for the current user, ignoring those
  # that are hidden based on the user's permission.
  # @param [User] user
  # @return [Script[]]
  def self.valid_scripts(user)
    has_any_course_experiments = Course.has_any_course_experiments?(user)
    with_hidden = !has_any_course_experiments && user.hidden_script_access?
    scripts = with_hidden ? all_scripts : visible_scripts

    if has_any_course_experiments
      scripts = scripts.map do |script|
        alternate_script = script.alternate_script(user)
        alternate_script.presence || script
      end
    end

    if !with_hidden && has_any_pilot_access?(user)
      scripts = scripts.concat(all_scripts.select {|s| s.has_pilot_access?(user)})
    end

    scripts
  end

  class << self
    private

    def all_scripts
      Rails.cache.fetch('valid_scripts/all') do
        Script.all
      end
    end

    def visible_scripts
      Rails.cache.fetch('valid_scripts/valid') do
        Script.all.reject(&:hidden)
      end
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

  # Find the lockable or non-locakble stage based on its relative position.
  # Raises `ActiveRecord::RecordNotFound` if no matching stage is found.
  def stage_by_relative_position(position, lockable = false)
    stages.where(lockable: lockable).find_by!(relative_position: position)
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
      ScriptLevel, Level, Game, Concept, Callout, Video, Artist, Blockly, CourseScript
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
  end

  def cached
    return self unless Script.should_cache?
    self.class.get_from_cache(id)
  end

  def self.get_without_cache(id_or_name, version_year: nil, with_associated_models: true)
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
  # name, or a redirect to the latest version of the script within the specified
  # family. Also populates the script cache so that future responses will be cached.
  # For example:
  #   get_from_cache('11') --> script_cache['11'] = <Script id=11, name=...>
  #   get_from_cache('frozen') --> script_cache['frozen'] = <Script name="frozen", id=...>
  #   get_from_cache('csp1') --> script_cache['csp1'] = <Script redirect_to="csp1-2018">
  #   get_from_cache('csp1', version_year: '2017') --> script_cache['csp1/2017'] = <Script redirect_to="csp1-2017">
  #
  # @param id_or_name [String|Integer] script id, script name, or script family name.
  # @param version_year [String] If specified, when looking for a script to redirect
  #   to within a script family, redirect to this version rather than the latest.
  def self.get_from_cache(id_or_name, version_year: nil)
    if ScriptConstants::FAMILY_NAMES.include?(id_or_name)
      raise "Do not call Script.get_from_cache with a family_name. Call Script.get_script_family_redirect_for_user instead.  Family: #{id_or_name}"
    end

    return get_without_cache(id_or_name, version_year: version_year, with_associated_models: false) unless should_cache?
    cache_key_suffix = version_year ? "/#{version_year}" : ''
    cache_key = "#{id_or_name}#{cache_key_suffix}"
    script_cache.fetch(cache_key) do
      # Populate cache on miss.
      script_cache[cache_key] = get_without_cache(id_or_name, version_year: version_year)
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

  # Given a script family name, return a dummy Script with redirect_to field
  # pointing toward the latest stable script in that family, or to a specific
  # version_year if one is specified.
  # @param family_name [String] The name of the script family to search in.
  # @param version_year [String] Version year to return. Optional.
  # @return [Script|nil] A dummy script object, not persisted to the database,
  #   with only the redirect_to field set.
  def self.get_script_family_redirect(family_name, version_year: nil)
    script_name = Script.latest_stable_version(family_name, version_year: version_year).try(:name)
    script_name ? Script.new(redirect_to: script_name) : nil
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
    current_version_year = version_year || course&.version_year
    return nil unless current_version_year.present?

    # Redirect user to the latest assigned script in this family,
    # if one exists and it is newer than the current script.
    latest_assigned_version = Script.latest_assigned_version(family_name, user)
    latest_assigned_version_year = latest_assigned_version&.version_year || latest_assigned_version&.course&.version_year
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
    has_progress = user.scripts.include?(self) || course&.has_progress?(user)
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

    script_versions = Script.
      where(family_name: family_name).
      order("properties -> '$.version_year' DESC")

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
    script_levels.find {|sl| sl.id == script_level_id.to_i}
  end

  def get_script_level_by_relative_position_and_puzzle_position(relative_position, puzzle_position, lockable)
    relative_position ||= 1
    script_levels.to_a.find do |sl|
      sl.stage.lockable? == lockable &&
        sl.stage.relative_position == relative_position.to_i &&
        sl.position == puzzle_position.to_i &&
        !sl.bonus
    end
  end

  def get_script_level_by_chapter(chapter)
    chapter = chapter.to_i
    return nil if chapter < 1 || chapter > script_levels.to_a.size
    script_levels[chapter - 1] # order is by chapter
  end

  def get_bonus_script_levels(current_stage)
    unless @all_bonus_script_levels
      @all_bonus_script_levels = stages.map do |stage|
        {
          stageNumber: stage.relative_position,
          levels: stage.script_levels.select(&:bonus).map(&:summarize_as_bonus)
        }
      end
      @all_bonus_script_levels.select! {|stage| stage[:levels].any?}
    end

    @all_bonus_script_levels.select {|stage| stage[:stageNumber] <= current_stage.absolute_position}
  end

  private def csf_tts_level?
    k5_course?
  end

  private def csd_tts_level?
    [
      Script::CSD2_NAME,
      Script::CSD3_NAME,
      Script::CSD4_NAME,
      Script::CSD6_NAME,
      Script::CSD2_2018_NAME,
      Script::CSD3_2018_NAME,
      Script::CSD4_2018_NAME,
      Script::CSD6_2018_NAME,
      Script::CSD2_2019_NAME,
      Script::CSD3_2019_NAME,
      Script::CSD4_2019_NAME,
      Script::CSD6_2019_NAME
    ].include?(name)
  end

  private def csp_tts_level?
    [
      Script::CSP17_UNIT3_NAME,
      Script::CSP17_UNIT5_NAME,
      Script::CSP17_POSTAP_NAME,
      Script::CSP3_2018_NAME,
      Script::CSP5_2018_NAME,
      Script::CSP_POSTAP_2018_NAME,
      Script::CSP3_2019_NAME,
      Script::CSP5_2019_NAME,
      Script::CSP_POSTAP_2019_NAME
    ].include?(name)
  end

  private def hoc_tts_level?
    [
      Script::APPLAB_INTRO,
      Script::DANCE_PARTY_NAME,
      Script::DANCE_PARTY_EXTRAS_NAME,
      Script::ARTIST_NAME,
      Script::SPORTS_NAME,
      Script::BASKETBALL_NAME
    ].include?(name)
  end

  def text_to_speech_enabled?
    csf_tts_level? || csd_tts_level? || csp_tts_level? || hoc_tts_level? || name == Script::TTS_NAME
  end

  def hint_prompt_enabled?
    [
      Script::COURSE2_NAME,
      Script::COURSE3_NAME,
      Script::COURSE4_NAME
    ].include?(name)
  end

  def hide_solutions?
    name == 'algebra'
  end

  def banner_image
    if has_banner?
      "banner_#{name}.jpg"
    end
  end

  def has_lesson_pdf?
    return false if ScriptConstants.script_in_category?(:csf, name) || ScriptConstants.script_in_category?(:csf_2018, name)

    has_lesson_plan?
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

  # Create or update any scripts, script levels and stages specified in the
  # script file definitions. If new_suffix is specified, create a copy of the
  # script and any associated levels, appending new_suffix to the name when
  # copying. Any new_properties are merged into the properties of the new script.
  def self.setup(custom_files, new_suffix: nil, new_properties: {})
    transaction do
      scripts_to_add = []

      custom_i18n = {}
      # Load custom scripts from Script DSL format
      custom_files.map do |script|
        name = File.basename(script, '.script')
        base_name = Script.base_name(name)
        name = "#{base_name}-#{new_suffix}" if new_suffix
        script_data, i18n = ScriptDSL.parse_file(script, name)

        stages = script_data[:stages]
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
        }, stages]
      end

      # Stable sort by ID then add each script, ensuring scripts with no ID end up at the end
      added_scripts = scripts_to_add.sort_by.with_index {|args, idx| [args[0][:id] || Float::INFINITY, idx]}.map do |options, raw_stages|
        add_script(options, raw_stages, new_suffix: new_suffix)
      end
      [added_scripts, custom_i18n]
    end
  end

  # if new_suffix is specified, copy the script, hide it, and copy all its
  # levelbuilder-defined levels.
  def self.add_script(options, raw_stages, new_suffix: nil)
    raw_script_levels = raw_stages.map {|stage| stage[:scriptlevels]}.flatten
    script = fetch_script(options)
    script.update!(hidden: true) if new_suffix
    chapter = 0
    stage_position = 0; script_level_position = Hash.new(0)
    script_stages = []
    script_levels_by_stage = {}
    levels_by_key = script.levels.index_by(&:key)
    lockable_count = 0
    non_lockable_count = 0

    # Overwrites current script levels
    script.script_levels = raw_script_levels.map do |raw_script_level|
      raw_script_level.symbolize_keys!

      assessment = nil
      named_level = nil
      bonus = nil
      stage_flex_category = nil
      stage_lockable = nil

      levels = raw_script_level[:levels].map do |raw_level|
        raw_level.symbolize_keys!

        # Concepts are comma-separated, indexed by name
        raw_level[:concept_ids] = (concepts = raw_level.delete(:concepts)) && concepts.split(',').map(&:strip).map do |concept_name|
          (Concept.by_name(concept_name) || raise("missing concept '#{concept_name}'"))
        end

        raw_level_data = raw_level.dup
        assessment = raw_level.delete(:assessment)
        named_level = raw_level.delete(:named_level)
        bonus = raw_level.delete(:bonus)
        stage_flex_category = raw_level.delete(:stage_flex_category)
        stage_lockable = !!raw_level.delete(:stage_lockable)

        key = raw_level.delete(:name)

        if raw_level[:level_num] && !key.starts_with?('blockly')
          # a levels.js level in a old style script -- give it the same key that we use for levels.js levels in new style scripts
          key = ['blockly', raw_level.delete(:game), raw_level.delete(:level_num)].join(':')
        end

        level =
          if new_suffix && !key.starts_with?('blockly')
            Level.find_by_name(key).clone_with_suffix("_#{new_suffix}")
          else
            levels_by_key[key] || Level.find_by_key(key)
          end

        if key.starts_with?('blockly')
          # this level is defined in levels.js. find/create the reference to this level
          level = Level.
            create_with(name: 'blockly').
            find_or_create_by!(Level.key_to_params(key))
          level = level.with_type(raw_level.delete(:type) || 'Blockly') if level.type.nil?
          if level.video_key && !raw_level[:video_key]
            raw_level[:video_key] = nil
          end

          level.update(raw_level)
        elsif raw_level[:video_key]
          level.update(video_key: raw_level[:video_key])
        end

        unless level
          raise ActiveRecord::RecordNotFound, "Level: #{raw_level_data.to_json}, Script: #{script.name}"
        end

        level
      end

      stage_name = raw_script_level.delete(:stage)
      properties = raw_script_level.delete(:properties) || {}

      if new_suffix && properties[:variants]
        properties[:variants] = properties[:variants].map do |old_level_name, value|
          ["#{old_level_name}_#{new_suffix}", value]
        end.to_h
      end

      script_level_attributes = {
        script_id: script.id,
        chapter: (chapter += 1),
        named_level: named_level,
        bonus: bonus,
        assessment: assessment
      }
      script_level_attributes[:properties] = properties.with_indifferent_access
      script_level = script.script_levels.detect do |sl|
        script_level_attributes.all? {|k, v| sl.send(k) == v} &&
          sl.levels == levels
      end || ScriptLevel.create!(script_level_attributes) do |sl|
        sl.levels = levels
      end
      # Set/create Stage containing custom ScriptLevel
      if stage_name
        stage = script.stages.detect {|s| s.name == stage_name} ||
          Stage.find_or_create_by(
            name: stage_name,
            script: script,
          ) do |s|
            s.relative_position = 0 # will be updated below, but cant be null
          end

        stage.assign_attributes(flex_category: stage_flex_category, lockable: stage_lockable)
        stage.save! if stage.changed?

        script_level_attributes[:stage_id] = stage.id
        script_level_attributes[:position] = (script_level_position[stage.id] += 1)
        script_level.reload
        script_level.assign_attributes(script_level_attributes)
        script_level.save! if script_level.changed?
        (script_levels_by_stage[stage.id] ||= []) << script_level
        unless script_stages.include?(stage)
          if stage_lockable
            stage.assign_attributes(relative_position: (lockable_count += 1))
          else
            stage.assign_attributes(relative_position: (non_lockable_count += 1))
          end
          stage.assign_attributes(absolute_position: (stage_position += 1))
          stage.save! if stage.changed?
          script_stages << stage
        end
      end
      script_level.assign_attributes(script_level_attributes)
      script_level.save! if script_level.changed?
      script_level
    end
    script_stages.each do |stage|
      # make sure we have an up to date view
      stage.reload
      stage.script_levels = script_levels_by_stage[stage.id]

      # Go through all the script levels for this stage, except the last one,
      # and raise an exception if any of them are a multi-page assessment.
      # (That's when the script level is marked assessment, and the level itself
      # has a pages property and more than one page in that array.)
      # This is because only the final level in a stage can be a multi-page
      # assessment.
      stage.script_levels.each do |script_level|
        if !script_level.end_of_stage? && script_level.long_assessment?
          raise "Only the final level in a stage may be a multi-page assessment.  Script: #{script.name}"
        end
      end

      if stage.lockable && !stage.script_levels.last.assessment?
        raise 'Expect lockable stages to have an assessment as their last level'
      end

      raw_stage = raw_stages.find {|rs| rs[:stage].downcase == stage.name.downcase}
      stage.stage_extras_disabled = raw_stage[:stage_extras_disabled]
      stage.save! if stage.changed?
    end

    script.stages = script_stages
    script.reload.stages
    script.generate_plc_objects

    script
  end

  # Clone this script, appending a dash and the suffix to the name of this
  # script. Also clone all the levels in the script, appending an underscore and
  # the suffix to the name of each level. Mark the new script as hidden, and
  # copy any translations and other metadata associated with the original script.
  def clone_with_suffix(new_suffix)
    new_name = "#{base_name}-#{new_suffix}"

    script_filename = "#{Script.script_directory}/#{name}.script"
    new_properties = {
      is_stable: false,
      script_announcements: nil
    }
    if /^[0-9]{4}$/ =~ (new_suffix)
      new_properties[:version_year] = new_suffix
    end
    scripts, _ = Script.setup([script_filename], new_suffix: new_suffix, new_properties: new_properties)
    new_script = scripts.first

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
    scripts_yml = File.expand_path('config/locales/scripts.en.yml')
    i18n = File.exist?(scripts_yml) ? YAML.load_file(scripts_yml) : {}
    i18n.deep_merge!(summarize_i18n_for_copy(new_name)) {|_, old, _| old}
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
    Script.includes(:levels, :script_levels, stages: :script_levels)
  end

  # Update strings and serialize changes to .script file
  def update_text(script_params, script_text, metadata_i18n, general_params)
    script_name = script_params[:name]
    begin
      transaction do
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
          script_data[:stages],
        )
        Script.merge_and_write_i18n(i18n, script_name, metadata_i18n)
      end
    rescue StandardError => e
      errors.add(:base, e.to_s)
      return false
    end
    update_teacher_resources(general_params[:resourceTypes], general_params[:resourceLinks])
    begin
      # write script to file
      filename = "config/scripts/#{script_params[:name]}.script"
      ScriptDSL.serialize(Script.find_by_name(script_name), filename)
      true
    rescue StandardError => e
      errors.add(:base, e.to_s)
      return false
    end
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
  # 1. Stage names, which we get from the script DSL, and is passed in as stages_i18n here
  # 2. Script Metadata (title, descs, etc.) which is in metadata_i18n
  # 3. Stage descriptions, which arrive as JSON in metadata_i18n[:stage_descriptions]
  def self.merge_and_write_i18n(stages_i18n, script_name = '', metadata_i18n = {})
    scripts_yml = File.expand_path('config/locales/scripts.en.yml')
    i18n = File.exist?(scripts_yml) ? YAML.load_file(scripts_yml) : {}

    updated_i18n = update_i18n(i18n, stages_i18n, script_name, metadata_i18n)
    File.write(scripts_yml, "# Autogenerated scripts locale file.\n" + updated_i18n.to_yaml(line_width: -1))
  end

  def self.update_i18n(existing_i18n, stages_i18n, script_name = '', metadata_i18n = {})
    if metadata_i18n != {}
      stage_descriptions = metadata_i18n.delete(:stage_descriptions)
      metadata_i18n['stages'] = {}
      unless stage_descriptions.nil?
        JSON.parse(stage_descriptions).each do |stage|
          stage_name = stage['name']
          metadata_i18n['stages'][stage_name] = {
            'description_student' => stage['descriptionStudent'],
            'description_teacher' => stage['descriptionTeacher']
          }
        end
      end
      metadata_i18n = {'en' => {'data' => {'script' => {'name' => {script_name => metadata_i18n.to_h}}}}}
    end

    stages_i18n = {'en' => {'data' => {'script' => {'name' => stages_i18n}}}}
    existing_i18n.deep_merge(stages_i18n) {|_, old, _| old}.deep_merge!(metadata_i18n)
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

  def summarize(include_stages = true, user = nil, include_bonus_levels = false)
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

      peer_review_stage = {
        name: I18n.t('peer_review.review_count', {review_count: peer_reviews_to_complete}),
        flex_category: 'Peer Review',
        levels: levels,
        lockable: false
      }
    end

    has_older_course_progress = course.try(:has_older_version_progress?, user)
    has_older_script_progress = has_older_version_progress?(user)
    user_script = user && user_scripts.find_by(user: user)

    summary = {
      id: id,
      name: name,
      title: localized_title,
      description: localized_description,
      beta_title: Script.beta?(name) ? I18n.t('beta') : nil,
      course_id: course.try(:id),
      hidden: hidden,
      loginRequired: login_required,
      plc: professional_learning_course?,
      hideable_stages: hideable_stages?,
      disablePostMilestone: disable_post_milestone?,
      isHocScript: hoc?,
      peerReviewsRequired: peer_reviews_to_complete || 0,
      peerReviewStage: peer_review_stage,
      student_detail_progress_view: student_detail_progress_view?,
      project_widget_visible: project_widget_visible?,
      project_widget_types: project_widget_types,
      excludeCsfColumnInLegend: exclude_csf_column_in_legend?,
      teacher_resources: teacher_resources,
      stage_extras_available: stage_extras_available,
      has_verified_resources: has_verified_resources?,
      has_lesson_plan: has_lesson_plan?,
      curriculum_path: curriculum_path,
      script_announcements: script_announcements,
      age_13_required: logged_out_age_13_required?,
      show_course_unit_version_warning: !course&.has_dismissed_version_warning?(user) && has_older_course_progress,
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
      version_year: version_year
    }

    summary[:stages] = stages.map {|stage| stage.summarize(include_bonus_levels)} if include_stages
    summary[:professionalLearningCourse] = professional_learning_course if professional_learning_course?
    summary[:wrapupVideo] = wrapup_video.key if wrapup_video

    summary
  end

  def summarize_for_edit
    include_stages = false
    summary = summarize(include_stages)
    summary[:stages] = stages.map(&:summarize_for_edit)
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

  # Creates an object representing all translations associated with this script
  # and its stages, in a format that can be deep-merged with the contents of
  # scripts.en.yml.
  def summarize_i18n_for_copy(new_name)
    data = %w(title description description_short description_audience).map do |key|
      [key, I18n.t("data.script.name.#{name}.#{key}", default: '')]
    end.to_h

    data['stages'] = {}
    stages.each do |stage|
      data['stages'][stage.name] = {
        'name' => stage.name,
        'description_student' => (I18n.t "data.script.name.#{name}.stages.#{stage.name}.description_student", default: ''),
        'description_teacher' => (I18n.t "data.script.name.#{name}.stages.#{stage.name}.description_teacher", default: '')
      }
    end

    {'en' => {'data' => {'script' => {'name' => {new_name => data}}}}}
  end

  def summarize_i18n(include_stages=true)
    data = %w(title description description_short description_audience).map do |key|
      [key.camelize(:lower), I18n.t("data.script.name.#{name}.#{key}", default: '')]
    end.to_h

    if include_stages
      data['stageDescriptions'] = stages.map do |stage|
        {
          name: stage.name,
          descriptionStudent: (I18n.t "data.script.name.#{name}.stages.#{stage.name}.description_student", default: ''),
          descriptionTeacher: (I18n.t "data.script.name.#{name}.stages.#{stage.name}.description_teacher", default: '')
        }
      end
    end
    data
  end

  # Returns an array of objects showing the name and version year for all scripts
  # sharing the family_name of this course, including this one.
  def summarize_versions(user = nil)
    return [] unless family_name
    return [] unless courses.empty?
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
    Rails.cache.delete SCRIPT_CACHE_KEY
  end

  def localized_title
    I18n.t "data.script.name.#{name}.title"
  end

  def localized_assignment_family_title
    I18n.t("data.script.name.#{name}.assignment_family_title", default: localized_title)
  end

  def localized_description
    I18n.t "data.script.name.#{name}.description"
  end

  def disable_post_milestone?
    !Gatekeeper.allows('postMilestone', where: {script_name: name}, default: true)
  end

  def self.build_property_hash(script_data)
    {
      hideable_stages: script_data[:hideable_stages] || false, # default false
      exclude_csf_column_in_legend: script_data[:exclude_csf_column_in_legend] || false,
      professional_learning_course: script_data[:professional_learning_course] || false, # default false
      peer_reviews_to_complete: script_data[:peer_reviews_to_complete] || nil,
      student_detail_progress_view: script_data[:student_detail_progress_view] || false,
      project_widget_visible: script_data[:project_widget_visible] || false,
      project_widget_types: script_data[:project_widget_types],
      teacher_resources: script_data[:teacher_resources],
      stage_extras_available: script_data[:stage_extras_available] || false,
      has_verified_resources: !!script_data[:has_verified_resources],
      has_lesson_plan: !!script_data[:has_lesson_plan],
      curriculum_path: script_data[:curriculum_path],
      script_announcements: script_data[:script_announcements] || false,
      version_year: script_data[:version_year],
      is_stable: script_data[:is_stable],
      supported_locales: script_data[:supported_locales],
      pilot_experiment: script_data[:pilot_experiment],
      editor_experiment: script_data[:editor_experiment],
      project_sharing: !!script_data[:project_sharing],
      curriculum_umbrella: script_data[:curriculum_umbrella]
    }.compact
  end

  # A script is considered to have a matching course if there is exactly one
  # course for this script
  def course
    return nil if course_scripts.length != 1
    Course.get_from_cache(course_scripts[0].course_id)
  end

  # @return {String|nil} path to the course overview page for this script if there
  #   is one.
  def course_link(section_id = nil)
    return nil unless course
    path = course_path(course)
    path += "?section_id=#{section_id}" if section_id
    path
  end

  def course_title
    course.try(:localized_title)
  end

  # If there is an alternate version of this script which the user should be on
  # due to existing progress or a course experiment, return that script. Otherwise,
  # return nil.
  def alternate_script(user)
    course_scripts.each do |cs|
      alternate_cs = cs.course.select_course_script(user, cs)
      return alternate_cs.script if cs != alternate_cs
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
    info[:is_stable] = true if is_stable

    info[:category] = I18n.t("data.script.category.#{info[:category]}_category_name", default: info[:category])
    info[:supported_locales] = supported_locale_names
    info[:stage_extras_available] = stage_extras_available

    info
  end

  def supported_locale_names
    locales = supported_locales || []
    locales = locales.map {|l| Script.locale_english_name_map[l] || l}
    locales += ['English']
    locales.sort.uniq
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
          stageNum: script_level.stage.relative_position.to_s,
          stageName: script_level.stage.localized_title,
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

  def self.get_version_year_options
    Course.get_version_year_options
  end
end

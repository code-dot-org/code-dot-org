# == Schema Information
#
# Table name: scripts
#
#  id                   :integer          not null, primary key
#  name                 :string(255)      not null
#  created_at           :datetime
#  updated_at           :datetime
#  wrapup_video_id      :integer
#  user_id              :integer
#  login_required       :boolean          default(FALSE), not null
#  properties           :text(65535)
#  new_name             :string(255)
#  family_name          :string(255)
#  published_state      :string(255)      default("in_development")
#  instruction_type     :string(255)
#  instructor_audience  :string(255)
#  participant_audience :string(255)
#
# Indexes
#
#  index_scripts_on_family_name           (family_name)
#  index_scripts_on_instruction_type      (instruction_type)
#  index_scripts_on_instructor_audience   (instructor_audience)
#  index_scripts_on_name                  (name) UNIQUE
#  index_scripts_on_new_name              (new_name) UNIQUE
#  index_scripts_on_participant_audience  (participant_audience)
#  index_scripts_on_published_state       (published_state)
#  index_scripts_on_wrapup_video_id       (wrapup_video_id)
#

require 'cdo/shared_constants'
require 'cdo/shared_constants/curriculum/shared_course_constants'
require 'ruby-progressbar'

TEXT_RESPONSE_TYPES = [TextMatch, FreeResponse]

# A sequence of Levels
class Unit < ApplicationRecord
  self.table_name = 'scripts'

  include ScriptConstants
  include Curriculum::SharedCourseConstants
  include SharedConstants
  include Curriculum::CourseTypes
  include Curriculum::AssignableCourse
  include Rails.application.routes.url_helpers
  include Unit::TextToSpeech

  include Seeded
  has_many :lesson_groups, -> {order(:position)}, foreign_key: 'script_id', dependent: :destroy
  has_many :lessons, through: :lesson_groups
  has_many :script_levels, through: :lessons
  has_many :levels_script_levels, through: :script_levels # needed for seeding logic
  has_many :levels, through: :script_levels
  has_and_belongs_to_many :resources, join_table: :scripts_resources, foreign_key: 'script_id'
  has_many :scripts_resources, foreign_key: 'script_id'
  has_many :scripts_student_resources, foreign_key: 'script_id', dependent: :destroy
  has_many :student_resources, through: :scripts_student_resources, source: :resource
  has_many :users, through: :user_scripts
  has_many :user_scripts, foreign_key: 'script_id'
  has_many :hint_view_requests, foreign_key: 'script_id'
  has_one :plc_course_unit, class_name: 'Plc::CourseUnit', foreign_key: 'script_id', inverse_of: :script, dependent: :destroy
  belongs_to :wrapup_video, class_name: 'Video', optional: true
  belongs_to :user, optional: true
  has_many :unit_group_units, foreign_key: 'script_id', dependent: :destroy
  has_many :unit_groups, through: :unit_group_units
  has_one :course_version, as: :content_root, dependent: :destroy

  scope :with_associated_models, -> do
    includes(
      [
        {
          script_levels: [
            {
              levels: [
                :concepts,
                :game,
                :level_concept_difficulty,
                :levels_child_levels
              ]
            },
            :lesson,
            :callouts
          ]
        },
        :lesson_groups,
        :resources,
        :student_resources,
        {
          lessons: [
            :lesson_activities,
            {script_levels: [:levels]}
          ]
        },
        {
          unit_group_units: :unit_group
        },
        {
          course_version: {
            course_offering: :course_versions
          }
        }
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
            :programming_expressions,
            :objectives,
            {rubric: {learning_goals: :learning_goal_evidence_levels}},
            :standards,
            :opportunity_standards
          ]
        },
        :script_levels,
        :levels,
        :resources,
        :student_resources
      ]
    )
  end

  attr_accessor :skip_name_format_validation

  include SerializedToFileValidation

  after_save :hide_pilot_units

  # Ideally this would be done in a before_validation hook, to avoid saving twice.
  # however this is not practical to do given how rails validations work for
  # activerecord-import during the seed process.
  def hide_pilot_units
    if !unit_group && pilot_experiment.present? && published_state != Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot
      update!(published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.pilot)
    end
  end

  # As we read and write to files with the unit name, to prevent directory
  # traversal (for security reasons), we do not allow the name to start with a
  # tilde or dot or contain a slash.
  validates :name,
    presence: true,
    format: {
      without: /\A~|\A\.|\//,
      message: 'cannot start with a tilde or dot or contain slashes'
    }

  validates_presence_of :link
  validates :published_state, acceptance: {accept: Curriculum::SharedCourseConstants::PUBLISHED_STATE.to_h.values.push(nil), message: 'must be nil, in_development, pilot, beta, preview or stable'}
  validate :deeper_learning_courses_cannot_be_launched

  def deeper_learning_courses_cannot_be_launched
    if old_professional_learning_course? && (launched? || pilot?)
      errors.add(:published_state, 'can never be pilot, preview or stable for a deeper learning course.')
    end
  end

  after_save :check_course_type_settings

  def check_course_type_settings
    if is_course?
      raise 'Published state must be set on the unit if its a standalone unit.' if published_state.nil?
      raise 'Instructor audience must be set on the unit if its a standalone unit.' if instructor_audience.nil?
      raise 'Participant audience must be set on the unit if its a standalone unit.' if participant_audience.nil?
      raise 'Instruction type must be set on the unit if its a standalone unit.' if instruction_type.nil?
    end
  end

  def prevent_new_duplicate_levels(old_dup_level_keys = [])
    new_dup_level_keys = duplicate_level_keys - old_dup_level_keys
    raise "new duplicate levels detected in unit: #{new_dup_level_keys}" if new_dup_level_keys.any?
  end

  def duplicate_level_keys
    return [] if levels.count == levels.uniq.count
    levels_by_key = levels.map(&:key).group_by {|key| key}
    levels_by_key.select {|_key, values| values.count > 1}.keys
  end

  include SerializedProperties

  after_save :generate_plc_objects

  UNIT_DIRECTORY = "#{Rails.root}/config/scripts".freeze

  TEACHER_FEEDBACK_INITIATIVES = %w(CSF CSC CSD CSP CSA).freeze

  def prevent_course_version_change?
    resources.any? ||
      student_resources.any? ||
      lessons.any? {|l| l.resources.count > 0 || l.vocabularies.count > 0}
  end

  def self.unit_directory
    UNIT_DIRECTORY
  end

  UNIT_JSON_DIRECTORY = "#{Rails.root}/config/scripts_json".freeze

  def self.unit_json_directory
    UNIT_JSON_DIRECTORY
  end

  # We have two different ways to create professional learning courses
  # You can create them in the normal curriculum model or you can create
  # them using the PLC course models(which build on top of the normal curriculum model).
  # We are moving toward everything being on the normal curriculum model. Until
  # then the only courses that should be on the PLC course models are ones previous created
  # and new courses that need the peer review system which is part of the PLC course models.
  #
  # This returns true if a course uses the PLC course models.
  def old_professional_learning_course?
    professional_learning_course.present?
  end

  def generate_plc_objects
    if old_professional_learning_course?
      unit_group = UnitGroup.find_by_name(professional_learning_course)

      new_published_state = published_state ? published_state : Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
      new_instruction_type = instruction_type ? instruction_type : Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led
      new_instructor_audience = instructor_audience ? instructor_audience : Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.plc_reviewer
      new_participant_audience = participant_audience ? participant_audience : Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.facilitator

      if unit_group
        # Check if anything needs to be updated on the PL course
        unit_group.published_state = new_published_state
        unit_group.instruction_type = new_instruction_type
        unit_group.participant_audience = new_participant_audience
        unit_group.instructor_audience = new_instructor_audience
        unit_group.save! if unit_group.changed?
      else
        unit_group = UnitGroup.new(
          name: professional_learning_course,
          published_state: new_published_state,
          instruction_type: new_instruction_type,
          instructor_audience: new_instructor_audience,
          participant_audience: new_participant_audience
        )
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

  # is_course - true if this Unit is intended to be the root of a
  #   CourseOffering version.  Used during seeding to create the appropriate
  #   CourseVersion and CourseOffering objects. For example, this should be
  #   true for CourseA-CourseF .script files.
  # seeded_from - a timestamp indicating when this object was seeded from
  #   its script_json file, as determined by the serialized_at value within
  #   said json.  Expect this to be nil on levelbulider, since those objects
  #   are created, not seeded. Used by the staging build to identify when a
  #   unit is being updated, so we can regenerate PDFs.
  # is_deprecated - true if the unit is deprecated. If this flag is set, we will redirect
  #   all /s, /lessons and /levels page in that unit to our "This course is deprecated" page.
  #   We don't use published_state here because some courses in the deprecated published state
  #   are not ready to be redirected. In the future we should unify these two states.
  serialized_attrs %w(
    hideable_lessons
    professional_learning_course
    only_instructor_review_required
    peer_reviews_to_complete
    redirect_to
    student_detail_progress_view
    project_widget_visible
    project_widget_types
    lesson_extras_available
    has_verified_resources
    curriculum_path
    announcements
    version_year
    supported_locales
    pilot_experiment
    editor_experiment
    project_sharing
    curriculum_umbrella
    tts
    is_course
    show_calendar
    weekly_instructional_minutes
    include_student_lesson_plans
    is_migrated
    seeded_from
    use_legacy_lesson_plans
    is_deprecated
  )

  def self.twenty_hour_unit
    Unit.get_from_cache(Unit::TWENTY_HOUR_NAME)
  end

  def self.hoc_2014_unit
    Unit.get_from_cache(Unit::HOC_NAME)
  end

  def self.starwars_unit
    Unit.get_from_cache(Unit::STARWARS_NAME)
  end

  def self.course1_unit
    Unit.get_from_cache(Unit::COURSE1_NAME)
  end

  def self.flappy_unit
    Unit.get_from_cache(Unit::FLAPPY_NAME)
  end

  class << self
    def all_scripts
      return all.to_a unless should_cache?
      @@all_scripts ||= script_cache.values.uniq.compact.freeze
    end

    def family_names
      Rails.cache.fetch('script/family_names', force: !Unit.should_cache?) do
        (CourseVersion.course_offering_keys('Unit') + ScriptConstants::DEPRECATED_FAMILY_NAMES).uniq.sort
      end
    end

    private def visible_units
      @@visible_units ||= all_scripts.select(&:launched?).to_a.freeze
    end

    private def log_script_yml_write(log_event_type:, unit_name:, old_size:, new_size:, lessons_i18n:, metadata_i18n:)
      record = {
        study: 'scripts_en_yml',
        event: log_event_type,
        data_string: unit_name,
        data_json: {
          old_size: old_size,
          new_size: new_size,
          delta: (new_size - old_size),
          lessons_i18n: lessons_i18n,
          metadata_i18n: metadata_i18n,
        }.to_json
      }
      FirehoseClient.instance.put_record(:analysis, record)

      # Firehose events do not log reliably on levelbuilder. For now, also
      # write them to the syslog so we can reliably find them there.
      CDO.log.info "Logging firehose event: #{record}"
    end
  end

  def starting_level
    raise "Unit #{name} has no level to start at" if script_levels.empty?
    candidate_level = script_levels.first.or_next_progression_level
    raise "Unit #{name} has no valid progression levels (non-unplugged) to start at" unless candidate_level
    candidate_level
  end

  # Find the lesson based on its relative position, lockable value, and if it has a lesson plan.
  # Raises `ActiveRecord::RecordNotFound` if no matching lesson is found.
  def lesson_by_relative_position(position, unnumbered_lesson: false)
    if unnumbered_lesson
      lessons.where(lockable: true, has_lesson_plan: false).find_by!(relative_position: position)
    else
      lessons.where(lockable: false).or(lessons.where(has_lesson_plan: true)).find_by!(relative_position: position)
    end
  end

  # For all units, cache all related information (levels, etc),
  # indexed by both id and name. This is cached both in a class
  # variable (ie. in memory in the worker process) and in a
  # distributed cache (Rails.cache)
  @@unit_cache = nil
  UNIT_CACHE_KEY = 'script-cache'.freeze

  # Caching is disabled when editing units and levels or running unit tests.
  def self.should_cache?
    return false if Rails.application.config.levelbuilder_mode
    return false unless Rails.application.config.cache_classes
    return false if ENV['UNIT_TEST'] || ENV['CI']
    true
  end

  def self.unit_cache_to_cache
    Rails.cache.write(UNIT_CACHE_KEY, (@@unit_cache = unit_cache_from_db))
  end

  def self.unit_cache_from_cache
    [
      ScriptLevel, Level, Game, Concept, Callout, Video, Artist, Blockly, UnitGroupUnit
    ].each(&:new) # make sure all possible loaded objects are completely loaded
    Rails.cache.read UNIT_CACHE_KEY
  end

  def self.unit_cache_from_db
    {}.tap do |cache|
      Unit.with_associated_models.find_each do |unit|
        cache[unit.name] = unit
        cache[unit.id.to_s] = unit
      end
    end
  end

  def self.script_cache
    return nil unless should_cache?
    @@unit_cache ||=
      unit_cache_from_cache || unit_cache_from_db
  end

  # Returns a cached map from script level id to script_level, or nil if in level_builder mode
  # which disables caching.
  def self.script_level_cache
    return nil unless should_cache?
    @@script_level_cache ||= {}.tap do |cache|
      script_cache.each_value do |unit|
        cache.merge!(unit.script_levels.index_by(&:id))
      end
    end
  end

  # Returns a cached map from level id and level name to level, or nil if in
  # level_builder mode which disables caching.
  def self.level_cache
    return nil unless should_cache?
    @@level_cache ||= {}.tap do |cache|
      script_level_cache.each_value do |script_level|
        level = script_level.level
        next unless level
        cache[level.id] = level unless cache.key? level.id
        cache[level.name] = level unless cache.key? level.name
      end
    end
  end

  # Returns a cached map from family_name to units, or nil if caching is disabled.
  def self.unit_family_cache
    return nil unless should_cache?
    @@unit_family_cache ||= {}.tap do |cache|
      family_units = script_cache.values.group_by(&:family_name)
      # Not all units have a family_name, and thus will be grouped as family_units[nil].
      # We do not want to store this key-value pair in the cache.
      family_units.delete(nil)
      cache.merge!(family_units)
    end
  end

  # Find the script level with the given id from the cache, unless the level build mode
  # is enabled in which case it is always fetched from the database. If we need to fetch
  # the unit and we're not in level mode (for example because the unit was created after
  # the cache), then an entry for the unit is added to the cache.
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
  rescue => exception
    raise exception, "Error finding level #{level_identifier}: #{exception}"
  end

  def cached
    return self unless Unit.should_cache?
    self.class.get_from_cache(id)
  end

  def self.get_without_cache(id_or_name, with_associated_models: true)
    # Also serve any unit by its new_name, if it has one.
    unit = id_or_name && Unit.find_by(new_name: id_or_name)
    return unit if unit

    # a bit of trickery so we support both ids which are numbers and
    # names which are strings that may contain numbers (eg. 2-3)
    is_id = id_or_name.to_i.to_s == id_or_name.to_s
    find_by = is_id ? :id : :name
    unit_model = with_associated_models ? Unit.with_associated_models : Unit
    unit = unit_model.find_by(find_by => id_or_name)
    return unit if unit
  end

  # Returns the unit with the specified id, or a unit with the specified
  # name. Also populates the unit cache so that future responses will be cached.
  # For example:
  #   get_from_cache('11') --> script_cache['11'] = <Unit id=11, name=...>
  #   get_from_cache('frozen') --> script_cache['frozen'] = <Unit name="frozen", id=...>
  #
  # @param id_or_name [String|Integer] script id, script name, or script family name.
  def self.get_from_cache(id_or_name, raise_exceptions: true)
    script =
      if should_cache?
        cache_key = id_or_name.to_s
        script_cache.fetch(cache_key) do
          # Populate cache on miss.
          script_cache[cache_key] = get_without_cache(id_or_name)
        end
      else
        get_without_cache(id_or_name, with_associated_models: false)
      end
    return script if script
    if raise_exceptions
      raise "Do not call Unit.get_from_cache with a family_name. Call Unit.get_unit_family_redirect_for_user instead.  Family: #{id_or_name}" if Unit.family_names.include?(id_or_name)
      raise ActiveRecord::RecordNotFound.new("Couldn't find Unit with id|name=#{id_or_name}")
    end
  end

  def self.get_family_without_cache(family_name)
    # This SQL string is not at risk for injection vulnerabilites because it's
    # just a hardcoded string, so it's safe to wrap in Arel.sql
    Unit.where(family_name: family_name).order(Arel.sql("properties -> '$.version_year' DESC"))
  end

  # Returns all units within a family from the Rails cache.
  # Populates the cache with units in that family upon cache miss.
  # @param family_name [String] Family name for the desired units.
  # @return [Array<Unit>] Scripts within the specified family.
  def self.get_family_from_cache(family_name)
    return Unit.get_family_without_cache(family_name) unless should_cache?

    unit_family_cache.fetch(family_name) do
      # Populate cache on miss.
      unit_family_cache[family_name] = Unit.get_family_without_cache(family_name)
    end
  end

  def self.remove_from_cache(unit_name)
    script_cache&.delete(unit_name)
  end

  def self.get_unit_family_redirect_for_user(family_name, user: nil, locale: 'en-US')
    return nil unless family_name

    family_units = Unit.get_family_from_cache(family_name).sort_by(&:version_year).reverse

    return nil unless family_units&.last&.can_be_instructor?(user) || family_units&.last&.can_be_participant?(user)

    # Only signed in participants should be redirected based on unit progress and/or section assignments.
    if user && family_units.last.can_be_participant?(user)
      assigned_unit_ids = user.section_scripts.pluck(:id)
      progress_unit_ids = user.user_levels.map(&:script_id)
      unit_ids = assigned_unit_ids.concat(progress_unit_ids).compact.uniq
      unit_name = family_units.select {|s| unit_ids.include?(s.id)}&.first&.name
      if unit_name
        # This creates a temporary script which is used to redirect the user. The audiences are set
        # to allow the redirect to happen for any user
        return Unit.new(
          redirect_to: unit_name,
          published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta,
          instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher,
          participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student
        )
      end
    end

    locale_str = locale&.to_s
    latest_version = nil
    family_units.each do |unit|
      next unless unit.stable?
      latest_version ||= unit

      # All English-speaking locales are supported, so we check that the locale starts with 'en' rather
      # than matching en-US specifically.
      is_supported = unit.supported_locales&.include?(locale_str) || locale_str&.downcase&.start_with?('en')
      if is_supported
        latest_version = unit
        break
      end
    end

    unit_name = latest_version&.name

    unit_name ?
      # This creates a temporary script which is used to redirect the user. The audiences are set
      # to allow the redirect to happen for any user
      Unit.new(
        redirect_to: unit_name,
        published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta,
        instructor_audience: Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher,
        participant_audience: Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student
      ) : nil
  end

  def self.log_redirect(old_unit_name, new_unit_name, request, event_name, user_type)
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: 'script-family-redirect',
        event: event_name,
        data_string: request.path,
        data_json: {
          old_script_name: old_unit_name,
          new_script_name: new_unit_name,
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
  # @return [String|nil] URL to the unit overview page the user should be redirected to (if any).
  def redirect_to_unit_url(user, locale: nil)
    # No redirect unless unit belongs to a family.
    return nil unless family_name
    # Only redirect participants.
    return nil unless user && can_be_participant?(user)
    return nil unless has_other_versions?
    # No redirect unless user is allowed to view this unit version and they are not already assigned to this unit
    # or the course it belongs to.
    return nil unless can_view_version?(user, locale: locale) && !user.assigned_script?(self)
    # No redirect if unit or its course are not versioned.
    current_version_year = version_year || unit_group&.version_year
    return nil if current_version_year.blank?

    # Redirect user to the latest assigned unit in this family,
    # if one exists and it is newer than the current unit.
    latest_assigned_version = Unit.latest_assigned_version(family_name, user)
    latest_assigned_version_year = latest_assigned_version&.version_year || latest_assigned_version&.unit_group&.version_year
    return nil unless latest_assigned_version_year && latest_assigned_version_year > current_version_year
    latest_assigned_version.link
  end

  def link
    Rails.application.routes.url_helpers.script_path(self)
  end

  # @param user [User]
  # @param locale [String] User or request locale. Optional.
  # @return [Boolean] Whether the user can view the unit.
  def can_view_version?(user, locale: nil)
    return false unless Ability.new(user).can?(:read, self)

    # Users can view any course not in a family.
    return true unless family_name

    latest_stable_version = Unit.latest_stable_version(family_name)
    latest_stable_version_in_locale = Unit.latest_stable_version(family_name, locale: locale)
    is_latest = latest_stable_version == self || latest_stable_version_in_locale == self

    # All users can see the latest unit version in English and in their locale.
    return true if is_latest

    # Restrictions only apply to participants and logged out users.
    return false if user.nil?
    return true if can_be_instructor?(user)

    # A student can view the unit version if they have progress in it or the course it belongs to.
    has_progress = user.scripts.include?(self) || unit_group&.has_progress?(user)
    return true if has_progress

    # A student can view the unit version if they are assigned to it.
    user.assigned_script?(self)
  end

  # If this unit is in a unit group, returns the next unit in the unit group.
  # If it's the last unit in the unit group, returns nil.
  # If it's not in a unit group, returns nil.
  def next_unit(user)
    return nil unless unit_group
    other_units = unit_group.units_for_user(user)
    self_index = other_units.index {|u| u.id == id}
    other_units[self_index + 1] if self_index
  end

  # @param family_name [String] The family name for a unit family.
  # @param version_year [String] Version year to return. Optional.
  # @param locale [String] User or request locale. Optional.
  # @return [Unit|nil] Returns the latest version in a unit family.
  def self.latest_stable_version(family_name, version_year: nil, locale: 'en-us')
    return nil if family_name.blank?

    unit_versions = Unit.get_family_from_cache(family_name).
      sort_by(&:version_year).reverse

    # Only select stable, supported units (ignore supported locales if locale is an English-speaking locale).
    # Match on version year if one is supplied.
    locale_str = locale&.to_s
    supported_stable_units = unit_versions.select do |unit|
      is_supported = unit.supported_locales&.include?(locale_str) || locale_str&.start_with?('en')
      if version_year
        unit.stable? && is_supported && unit.version_year == version_year
      else
        unit.stable? && is_supported
      end
    end

    supported_stable_units&.first
  end

  # @param family_name [String] The family name for a unit family.
  # @param user [User]
  # @return [Unit|nil] Returns the latest version in a family that the user is assigned to.
  def self.latest_assigned_version(family_name, user)
    return nil unless family_name && user
    assigned_unit_ids = user.section_scripts.pluck(:id)

    Unit.
      # select only units assigned to this user.
      where(id: assigned_unit_ids).
      # select only units in the same family.
      where(family_name: family_name).
      # order by version year descending.
      # This SQL string is not at risk for injection vulnerabilites because
      # it's just a hardcoded string, so it's safe to wrap in Arel.sql
      order(Arel.sql("properties -> '$.version_year' DESC"))&.
      first
  end

  # @param family_name [String] The family name for a unit family.
  # @param user [User]
  # @return [Unit|nil] Returns the latest unit version in a family that the user has progress in.
  def self.latest_version_with_progress(family_name, user)
    return nil unless family_name && user

    family_unit_versions = Unit.get_family_from_cache(family_name).
      sort_by(&:version_year).freeze
    family_unit_names = family_unit_versions.map(&:name)
    progress = UserScript.lookup_hash(user, family_unit_names)

    latest_version_with_progress = nil
    family_unit_versions.each do |version|
      latest_version_with_progress = version if progress[version.name]
    end
    latest_version_with_progress
  end

  def text_response_levels
    return @text_response_levels if Unit.should_cache? && @text_response_levels
    @text_response_levels = text_response_levels_without_cache
  end

  def text_response_levels_without_cache
    text_response_levels = []
    script_levels.map do |script_level|
      script_level.levels.map do |level|
        # We are looking for two types of text response levels: levels with contained levels
        # that are text response levels, and predict levels that are free response (predict
        # levels are used by lab2).
        is_not_contained = level.contained_levels.empty? ||
          TEXT_RESPONSE_TYPES.exclude?(level.contained_levels.first.class)
        is_not_predict_free_response = !level.predict_level? || level.properties.dig('predict_settings', 'questionType') != 'freeResponse'
        next if is_not_contained && is_not_predict_free_response
        text_response_level = level.predict_level? ? level : level.contained_levels.first
        text_response_levels << {
          script_level: script_level,
          levels: [text_response_level]
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

  def in_initiative?(initiative)
    return cached&.course_version&.course_offering&.marketing_initiative == initiative
  end

  # Legacy levels have different video and title logic in LevelsHelper.
  def legacy_curriculum?
    [
      Unit::TWENTY_HOUR_NAME,
      Unit::HOC_2013_NAME,
      Unit::EDIT_CODE_NAME,
      Unit::TWENTY_FOURTEEN_NAME,
      Unit::FLAPPY_NAME,
      Unit::JIGSAW_NAME
    ].include? name
  end

  def twenty_hour?
    name == '20-hour'
  end

  def hoc?
    get_course_version&.hoc?
  end

  def flappy?
    name == 'flappy'
  end

  def csf_international?
    ScriptConstants::CATEGORIES[:csf_international].include?(name)
  end

  def self.unit_names_by_curriculum_umbrella(curriculum_umbrella)
    Unit.where("properties -> '$.curriculum_umbrella' = ?", curriculum_umbrella).pluck(:name)
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

  def duration_in_minutes
    lessons.sum(&:total_lesson_duration)
  end

  # curriculum umbrella is deprecated. use in_initiative? instead.
  def under_curriculum_umbrella?(specific_curriculum_umbrella)
    curriculum_umbrella == specific_curriculum_umbrella
  end

  def k5_course?
    return false if twenty_hour?

    # TODO(dmcavoy): When we update course type to differentiate between k5 and 6-12 update this method
    k5_csc_course = [
      Unit::POETRY_2021_NAME,
      Unit::AI_ETHICS_2021_NAME,
      Unit::COUNTING_CSC_2021_NAME,
      Unit::EXPLORE_DATA_1_2021_NAME,
      Unit::SPELLING_BEE_2021_NAME
    ].include?(name)
    hoc_course = [
      Unit::POEM_ART_2021_NAME,
      Unit::HELLO_WORLD_FOOD_2021_NAME,
      Unit::HELLO_WORLD_ANIMALS_2021_NAME,
      Unit::HELLO_WORLD_EMOJI_2021_NAME,
      Unit::HELLO_WORLD_RETRO_2021_NAME
    ].include?(name)

    csf? || k5_csc_course || hoc_course
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

  def csa?
    under_curriculum_umbrella?('CSA')
  end

  def csc?
    in_initiative?('CSC')
  end

  # TODO: (Dani) Update to use new course types framework.
  # Currently this grouping is used to determine whether the script should have # a custom end-of-lesson experience.
  def middle_high?
    csd? || csp? || csa?
  end

  def requires_verified_instructor?
    # As of now the only course that requires the instructor to be verified in order to run code is CSA.
    # TODO: determine if this should be replaced with has_verified_resources? instead.
    return csa?
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

  def get_bonus_script_levels(current_lesson)
    unless @all_bonus_script_levels
      @all_bonus_script_levels = lessons.map do |lesson|
        {
          lessonNumber: lesson.relative_position,
          levels: lesson.script_levels.select(&:bonus)
        }
      end
      @all_bonus_script_levels.select! {|lesson| lesson[:levels].any?}
    end

    lesson_levels = @all_bonus_script_levels.select do |lesson|
      lesson[:lessonNumber] <= current_lesson.absolute_position
    end

    # we don't cache the level summaries because they include localized text
    summarized_lesson_levels = lesson_levels.map do |lesson|
      {
        lessonNumber: lesson[:lessonNumber],
        levels: lesson[:levels].map(&:summarize_as_bonus)
      }
    end
    summarized_lesson_levels
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
      Unit::CSP17_UNIT1_NAME,
      Unit::CSP17_UNIT2_NAME,
      Unit::CSP17_UNIT3_NAME,
      Unit::CSP_UNIT1_NAME,
      Unit::CSP_UNIT2_NAME,
      Unit::CSP_UNIT3_NAME,
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
  # @return [Boolean] Whether the user has progress on another version of this unit.
  def has_older_version_progress?(user)
    return nil unless user && family_name && version_year
    return nil unless has_other_versions?

    user_unit_ids = user.user_scripts.pluck(:script_id)

    Unit.
      # select only units in the same unit family.
      where(family_name: family_name).
      # select only older versions.
      where("properties -> '$.version_year' < ?", version_year).
      # exclude the current unit.
      where.not(id: id).
      # select only units which the user has progress in.
      where(id: user_unit_ids).
      count > 0
  end

  # When given an object from the unit cache, returns whether it has other
  # versions, without touching the database.
  def has_other_versions?
    get_course_version&.course_offering&.course_versions&.many?
  end

  def self.add_unit(options, raw_lesson_groups)
    transaction do
      unit = fetch_unit(options)

      unit.prevent_duplicate_lesson_groups(raw_lesson_groups)
      Unit.prevent_some_lessons_in_lesson_groups_and_some_not(raw_lesson_groups)

      # More all lessons into a temporary lesson group so that we do not delete
      # the lesson entries unless the lesson has been entirely removed from the
      # unit
      temp_lg = LessonGroup.create!(
        key: 'temp-will-be-deleted',
        script: unit,
        user_facing: false,
        position: unit.lesson_groups.length + 1
      )
      unit.lessons.each do |l|
        l.lesson_group = temp_lg
        l.save!
      end

      temp_lgs = LessonGroup.add_lesson_groups(raw_lesson_groups, unit)
      unit.reload
      unit.lesson_groups = temp_lgs

      # For migrated scripts, we use the updated_at field to detect potential
      # write conflicts when a curriculum editor tries to save an out-of-date
      # script edit page. therefore, touch the `updated_at` column whenever we
      # we save, even if it did not result an a change to the actual script
      # object. that way, we'll prevent write conflicts on changes to lesson
      # groups, as well as on fields which live only in scripts.en.yml.
      unit.touch(:updated_at) if unit.is_migrated

      unit.save!
      unit.prevent_legacy_script_levels_in_migrated_units

      unit.generate_plc_objects

      CourseOffering.add_course_offering(unit) if unit.is_course
      unit
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

  # Lesson groups can only show up once in a unit
  def prevent_duplicate_lesson_groups(raw_lesson_groups)
    previous_lesson_groups = []
    raw_lesson_groups.each do |lesson_group|
      if previous_lesson_groups.include?(lesson_group[:key])
        raise "Duplicate Lesson Group. Lesson Group: #{lesson_group[:key]} is used twice in Unit: #{name}."
      end
      previous_lesson_groups.append(lesson_group[:key])
    end
  end

  def prevent_legacy_script_levels_in_migrated_units
    if is_migrated && script_levels.reject(&:activity_section).any?
      lesson_names = lessons.all.select {|l| l.script_levels.reject(&:activity_section).any?}.map(&:name)
      raise "Legacy script levels are not allowed in migrated units. Problem lessons: #{lesson_names.to_json}"
    end
  end

  # Unit levels unfortunately have 3 position values:
  # 1. chapter: position within the Unit
  # 2. position: position within the Lesson
  # 3. activity_section_position: position within the ActivitySection.
  # This method uses activity_section_position as the source of truth to set the
  # values of position and chapter on all script levels in the unit.
  def fix_script_level_positions
    reload
    raise 'cannot fix script level positions on non-migrated units' unless is_migrated
    prevent_legacy_script_levels_in_migrated_units

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
  # 1. absolute_position: position within the unit (used to order lessons with in lesson groups in correct order)
  # 2. relative_position: position within the Unit relative other numbered/unnumbered lessons
  # This method updates the position values for all lessons in a unit after
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

  def clone_migrated_unit(new_name, new_level_suffix: nil, destination_unit_group_name: nil, destination_professional_learning_course: nil, version_year: nil, family_name:  nil)
    raise 'Unit name has already been taken' if Unit.find_by_name(new_name) || File.exist?(Unit.script_json_filepath(new_name))

    if destination_professional_learning_course.nil? && old_professional_learning_course?
      raise 'Deeper learning courses must be copied to be new deeper learning courses. Include destination_professional_learning_course to set the professional learning course.'
    end

    if !destination_professional_learning_course.nil? && !destination_unit_group_name.nil?
      raise 'Can not have both a destination unit group and a destination professional learning course.'
    end

    source_course_version = get_course_version
    destination_unit_group = destination_unit_group_name ?
      UnitGroup.find_by_name(destination_unit_group_name) :
      nil
    raise 'Destination unit group must have a course version' unless destination_unit_group.nil? || destination_professional_learning_course.nil? || destination_unit_group.course_version

    begin
      ActiveRecord::Base.transaction do
        copied_unit = dup

        copied_unit.pilot_experiment = nil
        copied_unit.tts = false
        copied_unit.announcements = nil
        copied_unit.name = new_name

        copied_unit.is_course = destination_unit_group.nil? && destination_professional_learning_course.nil?
        copied_unit.published_state = destination_unit_group.nil? ? Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development : nil
        copied_unit.instruction_type = destination_unit_group.nil? ? get_instruction_type : nil
        copied_unit.participant_audience = destination_unit_group.nil? ? get_participant_audience : nil
        copied_unit.instructor_audience = destination_unit_group.nil? ? get_instructor_audience : nil

        copied_unit.save!

        if !destination_professional_learning_course.nil?
          copied_unit.professional_learning_course = destination_professional_learning_course
          copied_unit.peer_reviews_to_complete = peer_reviews_to_complete
        elsif destination_unit_group
          raise 'Destination unit group must be in a course version' if destination_unit_group.course_version.nil?
          UnitGroupUnit.create!(unit_group: destination_unit_group, script: copied_unit, position: destination_unit_group.default_units.length + 1)
          copied_unit.reload
        else
          raise "Must supply version year if new unit will be a standalone unit" unless version_year
          copied_unit.version_year = version_year
          raise "Must supply family name if new unit will be a standalone unit" unless family_name
          copied_unit.family_name = family_name
          CourseOffering.add_course_offering(copied_unit)
        end

        copied_unit.save! if copied_unit.changed?

        lesson_groups.each do |original_lesson_group|
          original_lesson_group.copy_to_unit(copied_unit, new_level_suffix)
        end

        source_course_version&.reference_guides&.each do |reference_guide|
          reference_guide.copy_to_course_version(copied_unit.get_course_version)
        end

        if destination_professional_learning_course.nil?
          course_version = copied_unit.get_course_version
          copied_unit.resources = resources.map {|r| r.copy_to_course_version(course_version)}
          copied_unit.student_resources = student_resources.map {|r| r.copy_to_course_version(course_version)}
        end

        # Make sure we don't modify any files in unit tests.
        if Rails.application.config.levelbuilder_mode
          copy_and_write_i18n(new_name, course_version)
          copied_unit.write_script_json
          destination_unit_group&.write_serialization
        end

        copied_unit
      end
    rescue => exception
      filepath_to_delete = Unit.script_json_filepath(new_name)
      FileUtils.rm_f(filepath_to_delete)
      raise exception, "Error: #{exception.message}"
    end
  end

  def base_name
    Unit.base_name(name)
  end

  def self.base_name(name)
    # strip existing year suffix, if there is one
    m = /^(.*)-([0-9]{4})$/.match(name)
    m ? m[1] : name
  end

  # Creates a copy of all translations associated with this unit, and adds
  # them as translations for the unit named new_name.
  def copy_and_write_i18n(new_name, new_course_version)
    units_yml = File.expand_path("#{Rails.root}/config/locales/scripts.en.yml")
    i18n = File.exist?(units_yml) ? YAML.load_file(units_yml) : {}
    i18n.deep_merge!(summarize_i18n_for_copy(new_name, new_course_version))
    File.write(units_yml, "# Autogenerated scripts locale file.\n" + i18n.to_yaml(line_width: -1))
  end

  # unit is found/created by 'id' (if provided), or by 'new_name' (if provided
  # and found), otherwise by 'name'.
  #
  # Once a unit's 'new_name' has been seeded into the database, the script file
  # can then be renamed back and forth between its old name and its new_name (or to
  # any other name), and the corresponding script row in the db will be renamed.
  def self.fetch_unit(options)
    options.symbolize_keys!
    options[:wrapup_video] = options[:wrapup_video].blank? ? nil : Video.current_locale.find_by!(key: options[:wrapup_video])
    id = options.delete(:id)
    name = options[:name]
    new_name = options[:new_name]
    unit =
      if id
        Unit.with_default_fields.create_with(name: name).find_or_create_by({id: id})
      else
        (new_name && Unit.with_default_fields.find_by({new_name: new_name})) ||
          Unit.with_default_fields.find_or_create_by({name: name})
      end
    unit.update!(options.merge(skip_name_format_validation: true))
    unit
  end

  def self.with_default_fields
    Unit.includes(:levels, :script_levels, lessons: :script_levels)
  end

  def get_lesson_groups_i18n(lesson_groups_data)
    lessons_data = lesson_groups_data.map {|lg| lg['lessons']}.flatten

    # Do not write the names of existing lessons. Once a lesson has been
    # created, its name is owned by the lesson edit page.
    lessons_i18n = lessons_data.reject {|l| l['id']}.map do |lesson_data|
      [lesson_data['key'], {name: lesson_data['name']}]
    end.to_h

    lesson_groups_i18n = lesson_groups_data.select {|lg| lg['user_facing']}.map do |lg_data|
      [lg_data['key'], {display_name: lg_data['display_name']}]
    end.to_h

    {
      name => {
        lessons: lessons_i18n,
        lesson_groups: lesson_groups_i18n
      }
    }.deep_stringify_keys
  end

  # Update strings and serialize changes to .script file
  def update_text(unit_params, metadata_i18n, general_params)
    unit_name = unit_params[:name]
    # Check if TTS has been turned on for a unit. If so we will need to generate all the TTS for that unit after updating
    need_to_update_tts = general_params[:tts] && !tts

    begin
      lesson_groups = general_params[:lesson_groups]
      raise 'lesson_groups param is required for migrated scripts' unless lesson_groups
      unit_data = {lesson_groups: lesson_groups}
      i18n = get_lesson_groups_i18n(lesson_groups)
      Unit.add_unit(
        {
          name: unit_name,
          login_required: general_params[:login_required].nil? ? false : general_params[:login_required], # default false
          wrapup_video: general_params[:wrapup_video],
          family_name: general_params[:family_name].presence ? general_params[:family_name] : nil, # default nil
          published_state: (unit_group.present? && general_params[:published_state] == unit_group.published_state) ? nil : general_params[:published_state],
          instruction_type: unit_group.present? ? nil : general_params[:instruction_type],
          participant_audience: unit_group.present? ? nil : general_params[:participant_audience],
          instructor_audience: unit_group.present? ? nil : general_params[:instructor_audience],
          properties: Unit.build_property_hash(general_params)
        },
        unit_data[:lesson_groups]
      )
      if Rails.application.config.levelbuilder_mode
        Unit.merge_and_write_i18n(i18n, unit_name, metadata_i18n, log_event_type: 'write_script')
      end
    rescue StandardError => exception
      errors.add(:base, exception.to_s)
      return false
    end
    update_teacher_resources(general_params[:resourceIds])
    update_student_resources(general_params[:studentResourceIds])
    tts_update(update_all: true) if need_to_update_tts
    begin
      if Rails.application.config.levelbuilder_mode
        unit = Unit.find_by_name(unit_name)
        # Save in our custom JSON format. This is how we sync data across environments.
        unit.write_script_json
      end
      true
    rescue StandardError => exception
      errors.add(:base, exception.to_s)
      return false
    end
  end

  def write_script_json
    # make sure we only write script json in the levelbuilder environment.
    return unless Rails.application.config.levelbuilder_mode

    filepath = Unit.script_json_filepath(name)
    File.write(filepath, Services::ScriptSeed.serialize_seeding_json(self))
  end

  def update_teacher_resources(resource_ids)
    self.resources = (resource_ids || []).map {|id| Resource.find(id)}
  end

  def update_student_resources(resource_ids)
    self.student_resources = (resource_ids || []).map {|id| Resource.find(id)}
  end

  def self.rake
    # cf. http://stackoverflow.com/a/9943895
    require 'rake'
    Rake::Task.clear
    Dashboard::Application.load_tasks
    Rake::FileTask['config/scripts/.seeded'].invoke
  end

  # This method updates scripts.en.yml with i18n data from the units.
  # There are three types of i18n data
  # 1. Lesson names are passed in as lessons_i18n here. The script edit page
  #   will add to these when creating a new lesson.
  # 2. Unit Metadata (title, descs, etc.) which is in metadata_i18n
  def self.merge_and_write_i18n(lessons_i18n, unit_name = '', metadata_i18n = {}, log_event_type: 'write_other')
    units_yml = File.expand_path("#{Rails.root}/config/locales/scripts.en.yml")
    old_size = `wc -l #{units_yml.dump}`.to_i
    i18n = File.exist?(units_yml) ? YAML.load_file(units_yml) : {}

    updated_i18n = update_i18n(i18n, lessons_i18n, unit_name, metadata_i18n)
    if i18n == updated_i18n
      log_script_yml_write(
        log_event_type: "skipped_#{log_event_type}",
        unit_name: unit_name,
        old_size: old_size,
        new_size: old_size,
        lessons_i18n: lessons_i18n,
        metadata_i18n: metadata_i18n
      )
    else
      File.write(units_yml, "# Autogenerated scripts locale file.\n" + updated_i18n.to_yaml(line_width: -1))

      new_size = `wc -l #{units_yml.dump}`.to_i
      log_script_yml_write(
        log_event_type: log_event_type,
        unit_name: unit_name,
        old_size: old_size,
        new_size: new_size,
        lessons_i18n: lessons_i18n,
        metadata_i18n: metadata_i18n
      )
    end
  end

  def self.update_i18n(existing_i18n, lessons_i18n, unit_name = '', metadata_i18n = {})
    if metadata_i18n != {}
      metadata_i18n = {'en' => {'data' => {'script' => {'name' => {unit_name => metadata_i18n.to_h}}}}}
    end

    lessons_i18n = {'en' => {'data' => {'script' => {'name' => lessons_i18n}}}}
    existing_i18n.deep_merge(lessons_i18n).deep_merge!(metadata_i18n)
  end

  def hoc_finish_url
    if name == Unit::HOC_2013_NAME
      CDO.code_org_url '/api/hour/finish'
    else
      CDO.code_org_url "/api/hour/finish/#{name}"
    end
  end

  def csf_finish_url
    if name == Unit::TWENTY_HOUR_NAME
      # Rename from 20-hour to public facing Accelerated
      CDO.code_org_url "/congrats/#{Unit::ACCELERATED_NAME}"
    else
      CDO.code_org_url "/congrats/#{name}"
    end
  end

  def finish_url
    return hoc_finish_url if hoc?
    return csf_finish_url if csf?
    return CDO.code_org_url "/congrats/#{unit_group.name}" if unit_group
    CDO.code_org_url "/congrats/#{name}"
  end

  # A unit that the general public can assign. Has been soft or
  # hard launched.
  def launched?
    [Curriculum::SharedCourseConstants::PUBLISHED_STATE.preview, Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable].include?(get_published_state)
  end

  def deprecated?
    get_published_state == Curriculum::SharedCourseConstants::PUBLISHED_STATE.deprecated
  end

  def stable?
    get_published_state == Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
  end

  def in_development?
    get_published_state == Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
  end

  def summarize(include_lessons = true, user = nil, include_bonus_levels = false, locale_code = 'en-us')
    ActiveRecord::Base.connected_to(role: :reading) do
      # TODO: Set up peer reviews to be more consistent with the rest of the system
      # so that they don't need a bunch of one off cases (example peer reviews
      # don't have a lesson group in the database right now)
      if has_peer_reviews? && !only_instructor_review_required?
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
          name: I18n.t('peer_review.review_count', review_count: peer_reviews_to_complete),
          lesson_group_display_name: 'Peer Review',
          levels: levels,
          lockable: false
        }
      end

      has_older_course_progress = unit_group.try(:has_older_version_progress?, user)
      has_older_unit_progress = has_older_version_progress?(user)
      user_unit = user && user_scripts.find_by(user: user)

      # If the current user is assigned to this unit, get the section
      # that assigned it.
      assigned_section_id = user&.assigned_script?(self) ? user.section_for_script(self)&.id : nil

      summary = {
        id: id,
        name: name,
        title: title_for_display,
        description: Services::MarkdownPreprocessor.process(localized_description),
        studentDescription: Services::MarkdownPreprocessor.process(localized_student_description),
        course_id: unit_group.try(:id),
        publishedState: get_published_state,
        instructionType: get_instruction_type,
        instructorAudience: get_instructor_audience,
        participantAudience: get_participant_audience,
        loginRequired: login_required,
        plc: old_professional_learning_course?,
        hideable_lessons: hideable_lessons?,
        disablePostMilestone: disable_post_milestone?,
        csf: csf?,
        isCsd: csd?,
        isCsp: csp?,
        only_instructor_review_required: only_instructor_review_required?,
        peerReviewsRequired: peer_reviews_to_complete || 0,
        peerReviewLessonInfo: peer_review_lesson_info,
        student_detail_progress_view: student_detail_progress_view?,
        project_widget_visible: project_widget_visible?,
        project_widget_types: project_widget_types,
        teacher_resources: resources.sort_by(&:name).map(&:summarize_for_resources_dropdown),
        student_resources: student_resources.sort_by(&:name).map(&:summarize_for_resources_dropdown),
        lesson_extras_available: lesson_extras_available,
        has_verified_resources: has_verified_resources?,
        curriculum_path: curriculum_path,
        announcements: localized_announcements,
        age_13_required: logged_out_age_13_required?,
        show_course_unit_version_warning: !unit_group&.has_dismissed_version_warning?(user) && has_older_course_progress,
        show_script_version_warning: !user_unit&.version_warning_dismissed && !has_older_course_progress && has_older_unit_progress,
        course_versions: summarize_course_versions(user, locale_code),
        supported_locales: supported_locales,
        section_hidden_unit_info: section_hidden_unit_info(user),
        pilot_experiment: get_pilot_experiment,
        editor_experiment: editor_experiment,
        show_assign_button: course_assignable?(user),
        project_sharing: project_sharing,
        curriculum_umbrella: curriculum_umbrella,
        family_name: family_name,
        version_year: version_year,
        assigned_section_id: assigned_section_id,
        hasStandards: has_standards_associations?,
        tts: tts?,
        deprecated: deprecated?,
        is_course: is_course?,
        is_migrated: is_migrated?,
        scriptPath: script_path(self),
        showCalendar: is_migrated ? show_calendar : false, #prevent calendar from showing for non-migrated units for now
        weeklyInstructionalMinutes: weekly_instructional_minutes,
        includeStudentLessonPlans: is_migrated ? include_student_lesson_plans : false,
        useLegacyLessonPlans: is_migrated && use_legacy_lesson_plans,
        courseVersionId: get_course_version&.id,
        courseOfferingId: get_course_version&.course_offering&.id,
        scriptOverviewPdfUrl: get_unit_overview_pdf_url,
        scriptResourcesPdfUrl: get_unit_resources_pdf_url,
        updated_at: updated_at.to_s,
        isPlCourse: pl_course?
      }

      #TODO: lessons should be summarized through lesson groups in the future
      summary[:lessonGroups] = lesson_groups.map(&:summarize)
      summary[:lessons] = lessons.map {|lesson| lesson.summarize(include_bonus_levels)} if include_lessons
      summary[:deeperLearningCourse] = professional_learning_course if old_professional_learning_course?
      summary[:wrapupVideo] = wrapup_video.key if wrapup_video
      summary[:calendarLessons] = lessons.map(&:summarize_for_calendar)

      summary
    end
  end

  def unit_without_lesson_plans?
    lessons.none?(&:has_lesson_plan)
  end

  def summarize_for_rollup(user = nil)
    summary = {
      title: title_for_display,
      name: name,
      link: script_path(self)
    }
    # Only get lessons with lesson plans
    filtered_lessons = lessons.select(&:has_lesson_plan)
    summary[:lessons] = filtered_lessons.map {|lesson| lesson.summarize_for_rollup(user)}

    summary
  end

  def summarize_for_unit_edit
    include_lessons = false
    summary = summarize(include_lessons)
    summary[:lesson_groups] = lesson_groups.map(&:summarize_for_unit_edit)
    summary[:courseOfferingEditPath] = edit_course_offering_path(course_version&.course_offering&.key) if course_version
    summary[:missingRequiredDeviceCompatibilities] = course_version&.course_offering&.missing_required_device_compatibility?
    summary[:coursePublishedState] = unit_group ? unit_group.published_state : published_state
    summary[:unitPublishedState] = unit_group ? published_state : nil
    summary[:isCSDCourseOffering] = unit_group&.course_version&.course_offering&.csd?
    summary
  end

  def allow_major_curriculum_changes?
    get_published_state == PUBLISHED_STATE.in_development || get_published_state == PUBLISHED_STATE.pilot
  end

  def summarize_for_lesson_edit
    {
      allowMajorCurriculumChanges: allow_major_curriculum_changes?,
      courseVersionId: get_course_version&.id,
      unitPath: script_path(self),
      lessonExtrasAvailableForUnit: lesson_extras_available,
      isProfessionalLearningCourse: pl_course?
    }
  end

  # @return {Hash<string,number[]>}
  #   For teachers, this will be a hash mapping from section id to a list of hidden
  #   script ids for that section, filtered so that the only script id which appears
  #   is the current script id. This mirrors the output format of
  #   User#get_hidden_unit_ids, and satisfies the input format of
  #   initializeHiddenScripts in hiddenLessonRedux.js.
  def section_hidden_unit_info(user)
    return {} unless user && can_be_instructor?(user)
    hidden_section_ids = SectionHiddenScript.where(script_id: id, section: user.sections_instructed).pluck(:section_id)
    hidden_section_ids.index_with([id])
  end

  # Similar to summarize, but returns an even more narrow set of fields, restricted
  # to those needed in header.html.haml
  def summarize_header
    {
      name: name,
      displayName: title_for_display,
      disablePostMilestone: disable_post_milestone?,
      student_detail_progress_view: student_detail_progress_view?,
      age_13_required: logged_out_age_13_required?,
      show_sign_in_callout: csf? || csc?
    }
  end

  def summarize_for_lesson_show(is_student = false)
    {
      displayName: title_for_display,
      link: link,
      lessonGroups: lesson_groups.select {|lg| lg.lessons.any?(&:has_lesson_plan)}.map {|lg| lg.summarize_for_lesson_dropdown(is_student)},
      publishedState: get_published_state
    }
  end

  # Creates an object representing all translations associated with this unit
  # and its lessons, in a format that can be deep-merged with the contents of
  # scripts.en.yml.
  def summarize_i18n_for_copy(new_name, new_course_version)
    resource_markdown_replacement_proc = proc {|r| "[r #{Services::GloballyUniqueIdentifiers.build_resource_key(r.copy_to_course_version(new_course_version))}]"}
    vocab_markdown_replacement_proc = proc {|v| "[v #{Services::GloballyUniqueIdentifiers.build_vocab_key(v.copy_to_course_version(new_course_version))}]"}
    data = %w(title description student_description description_short description_audience).index_with do |key|
      I18n.t("data.script.name.#{name}.#{key}", default: '')
    end
    Services::MarkdownPreprocessor.sub_resource_links!(data['description'], resource_markdown_replacement_proc) if data['description']
    Services::MarkdownPreprocessor.sub_vocab_definitions!(data['description'], vocab_markdown_replacement_proc) if data['description']
    Services::MarkdownPreprocessor.sub_resource_links!(data['student_description'], resource_markdown_replacement_proc) if data['student_description']
    Services::MarkdownPreprocessor.sub_vocab_definitions!(data['student_description'], vocab_markdown_replacement_proc) if data['student_description']
    Services::MarkdownPreprocessor.sub_resource_links!(data['description_short'], resource_markdown_replacement_proc) if data['description_short']
    Services::MarkdownPreprocessor.sub_vocab_definitions!(data['description_short'], vocab_markdown_replacement_proc) if data['description_short']
    Services::MarkdownPreprocessor.sub_resource_links!(data['description_audience'], resource_markdown_replacement_proc) if data['description_audience']
    Services::MarkdownPreprocessor.sub_vocab_definitions!(data['description_audience'], vocab_markdown_replacement_proc) if data['description_audience']

    {'en' => {'data' => {'script' => {'name' => {new_name => data}}}}}
  end

  def summarize_i18n_for_edit
    data = %w(title description_short description_audience).map do |key|
      [key.camelize(:lower).to_sym, I18n.t("data.script.name.#{name}.#{key}", default: '')]
    end.to_h

    data[:description] = Services::MarkdownPreprocessor.process(I18n.t("data.script.name.#{name}.description", default: ''))
    data[:studentDescription] = Services::MarkdownPreprocessor.process(I18n.t("data.script.name.#{name}.student_description", default: ''))

    data
  end

  def summarize_i18n_for_display
    data = summarize_i18n_for_edit
    data[:title] = title_for_display
    data
  end

  # Returns summary object of all the course versions that an instructor can
  # assign or all the launched versions a participant can view. 'course_assignable'
  # will always return false for participants so they will fall into the second check for
  # launched and can_view_version?. For instructors if course_assignable? is false then
  # launched will also be false.
  def summarize_course_versions(user = nil, locale_code = 'en-us')
    return {} if unit_group

    all_course_versions = course_version&.course_offering&.course_versions
    course_versions_for_user = all_course_versions&.select {|cv| cv.course_assignable?(user) || (cv.launched? && cv.can_view_version?(user, locale: locale_code))}
    course_versions_for_user&.map {|cv| cv.summarize_for_assignment_dropdown(user, locale_code)}.to_h
  end

  def self.clear_cache
    raise "only call this in a test!" unless Rails.env.test?
    @@unit_cache = nil
    @@unit_family_cache = nil
    @@script_level_cache = nil
    @@level_cache = nil
    @@all_scripts = nil
    @@visible_units = nil
    Rails.cache.delete UNIT_CACHE_KEY
  end

  def localized_title
    I18n.t(
      "title",
      default: name,
      scope: [:data, :script, :name, name],
      smart: true
    )
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

  def localized_announcements
    return announcements if announcements.nil?
    announcements.deep_dup.each do |announcement|
      announcement['notice'] = I18n.t(
        "notice",
        default: announcement['notice'],
        scope: [:data, :script_announcements, announcement['key']],
        smart: true
      )
      announcement['details'] = I18n.t(
        "details",
        default: announcement['details'],
        scope: [:data, :script_announcements, announcement['key']],
        smart: true
      )
      announcement['buttonText'] = I18n.t(
        "buttonText",
        default: announcement['buttonText'],
        scope: [:data, :script_announcements, announcement['key']],
        smart: true
      )
    end
  end

  def disable_post_milestone?
    !Gatekeeper.allows('postMilestone', where: {script_name: name}, default: true)
  end

  # Returns a property hash that always has the same keys, even if those keys were missing
  # from the input. This ensures that values can be un-set via seeding or the unit edit UI.
  def self.build_property_hash(unit_data)
    # When adding a key, add it to the appropriate list based on whether you want it defaulted to nil or false.
    # The existing keys in this list may not all be in the right place theoretically, but when adding a new key,
    # try to put it in the appropriate place.
    nonboolean_keys = [
      :hideable_lessons,
      :professional_learning_course,
      :only_instructor_review_required,
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
      :weekly_instructional_minutes,
    ]
    boolean_keys = [
      :has_verified_resources,
      :project_sharing,
      :tts,
      :is_course,
      :show_calendar,
      :is_migrated,
      :include_student_lesson_plans,
      :use_legacy_lesson_plans
    ]

    result = {}
    # If a non-boolean prop was missing from the input, it'll get populated in the result hash as nil.
    nonboolean_keys.each {|k| result[k] = unit_data[k]}
    # If a boolean prop was missing from the input, it'll get populated in the result hash as false.
    boolean_keys.each {|k| result[k] = !!unit_data[k]}
    result
  end

  # A unit is considered to have a matching course if there is exactly one
  # unit_group for this unit
  def unit_group
    return nil if unit_group_units.length != 1
    UnitGroup.get_from_cache(unit_group_units[0].course_id)
  end

  # If this unit is a standalone unit, returns its CourseVersion. Otherwise,
  # if this unit belongs to a UnitGroup, returns the UnitGroup's CourseVersion,
  # if there is one.
  # @return [CourseVersion]
  def get_course_version
    course_version || unit_group&.course_version
  end

  # If a script is in a unit group, use that unit group's published state. If not, use the script's published_state
  # If both are null, the script is in_development
  def get_published_state
    published_state || unit_group&.published_state || Curriculum::SharedCourseConstants::PUBLISHED_STATE.in_development
  end

  # If a script is in a unit group, use that unit group's instruction type. If not, use the units's instruction type
  # If both are null, the unit should be teacher led
  def get_instruction_type
    unit_group&.instruction_type || instruction_type || Curriculum::SharedCourseConstants::INSTRUCTION_TYPE.teacher_led
  end

  # If a script is in a unit group, use that unit group's instructor_audience. If not, use the units's instructor_audience
  # If both are null, the unit should be instructed by teacher
  def get_instructor_audience
    unit_group&.instructor_audience || instructor_audience || Curriculum::SharedCourseConstants::INSTRUCTOR_AUDIENCE.teacher
  end

  # If a script is in a unit group, use that unit group's participant_audience. If not, use the units's participant_audience
  # If both are null, the unit should be participated in by students
  def get_participant_audience
    unit_group&.participant_audience || participant_audience || Curriculum::SharedCourseConstants::PARTICIPANT_AUDIENCE.student
  end

  # Use the unit group's pilot_experiment if one exists
  def get_pilot_experiment
    pilot_experiment || unit_group&.pilot_experiment
  end

  # @return {String|nil} path to the course overview page for this unit if there
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

  def unversioned?
    version_year.blank? || version_year == CourseVersion::UNVERSIONED
  end

  def included_in_units?(unit_ids)
    unit_ids.include? id
  end

  def summarize_for_unit_selector
    {
      id: id,
      key: name,
      version_year: version_year,
      name: launched? ? localized_title : localized_title + " *",
      position: unit_group_units&.first&.position,
      description: localized_description ? Services::MarkdownPreprocessor.process(localized_description) : nil,
      is_feedback_enabled: teacher_feedback_enabled?
    }
  end

  def summarize_for_assignment_dropdown
    [
      id,
      {
        id: id,
        name: launched? ? localized_title : localized_title + " *",
        path: link,
        lesson_extras_available: lesson_extras_available?,
        text_to_speech_enabled: text_to_speech_enabled?,
        position: unit_group_units&.first&.position,
        requires_verified_instructor: requires_verified_instructor?
      }
    ]
  end

  def supported_locale_codes
    locales = supported_locales || []
    locales += ['en-US'] unless locales.include? 'en-US'
    locales.sort
  end

  def supported_locale_names
    supported_locale_codes.map {|l| Unit.locale_native_name_map[l] || l}.uniq
  end

  def self.locale_native_name_map
    locales = Dashboard::Application::LOCALES.select {|_, data| data.is_a?(Hash)}
    locales.reduce({}) {|acc, (locale_code, data)| acc.merge({locale_code => data[:native]})}
  end

  def self.locale_english_name_map
    locales = Dashboard::Application::LOCALES.select {|_, data| data.is_a?(Hash)}
    locales.reduce({}) {|acc, (locale_code, data)| acc.merge({locale_code => data[:english]})}
  end

  # Get all script levels that are level groups, and return a list of those that are
  # not anonymous assessments.
  def get_assessment_script_levels
    script_levels.select do |sl|
      sl.levels.first.is_a?(LevelGroup) && sl.long_assessment? && !sl.anonymous?
    end
  end

  def get_feedback_for_section(section)
    feedback = {}

    student_ids = section.students.map(&:id)
    all_feedback = TeacherFeedback.get_latest_feedbacks_given(student_ids, nil, id, section.user_id)

    feedback_hash = {}
    all_feedback.each do |feedback_element|
      feedback_hash[feedback_element.student_id] ||= {}
      feedback_hash[feedback_element.student_id][feedback_element.level_id] = feedback_element
    end

    script_levels.each do |script_level|
      current_level = script_level.oldest_active_level

      if current_level.can_have_feedback?
        section.students.each do |student|
          next unless temp_feedback = feedback_hash.dig(student.id, current_level.id)
          feedback[temp_feedback.id] = temp_feedback.summarize_for_csv(current_level, script_level, student)
        end
      end

      next unless sublevels = current_level.try(:sublevels)
      sublevels.each_with_index do |sublevel, sublevel_index|
        next unless sublevel.can_have_feedback?

        section.students.each do |student|
          next unless temp_feedback = feedback_hash.dig(student.id, sublevel.id)
          feedback[temp_feedback.id] = temp_feedback.summarize_for_csv(sublevel, script_level, student, sublevel_index)
        end
      end
    end

    return feedback
  end

  def pilot?
    get_pilot_experiment.present?
  end

  def has_pilot_access?(user = nil)
    return false unless pilot? && user
    return true if user.permission?(UserPermission::LEVELBUILDER)
    return true if has_pilot_experiment?(user)
    # a platformization partner should be able to view pilot units which they
    # own, even if they are not in the pilot experiment.
    return true if has_editor_experiment?(user)

    # A user without the experiment has pilot unit access if
    # (1) they have been assigned to or have progress in the pilot unit, and
    # (2) one of their teachers has the pilot experiment enabled.
    has_progress = !!UserScript.find_by(user: user, script: self)
    has_progress && user.teachers.any? {|t| has_pilot_experiment?(t)}
  end

  # Whether this particular user has the pilot experiment enabled.
  def has_pilot_experiment?(user)
    user.has_pilot_experiment?(get_pilot_experiment)
  end

  # returns true if the user is a levelbuilder, or a teacher with any pilot
  # unit experiments enabled.
  def self.has_any_pilot_access?(user = nil)
    return false unless user&.teacher?
    return true if user.permission?(UserPermission::LEVELBUILDER)
    all_scripts.any? {|unit| unit.has_pilot_experiment?(user)}
  end

  # If a user is in the editor experiment of this unit, that indicates that
  # they are a platformization partner who owns this unit.
  def has_editor_experiment?(user)
    user.has_pilot_experiment?(editor_experiment)
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

  # @param [String] unit_name - name of the unit to seed from .script_json
  # @returns [Unit] - the newly seeded unit object
  def self.seed_from_json_file(unit_name)
    filepath = script_json_filepath(unit_name)
    Services::ScriptSeed.seed_from_json_file(filepath) if File.exist?(filepath)
  end

  def self.script_json_filepath(unit_name)
    "#{unit_json_directory}/#{unit_name}.script_json"
  end

  def get_unit_overview_pdf_url
    if is_migrated? && !use_legacy_lesson_plans?
      Services::CurriculumPdfs.get_script_overview_url(self)
    end
  end

  def get_unit_resources_pdf_url
    return nil unless is_migrated?
    return nil if use_legacy_lesson_plans?

    # Check if there are any resources that would be included in the rollup PDF, and, therefore, if there's a useful PDF to surface to users
    if resources.any?(&:should_include_in_pdf?) || student_resources.any?(&:should_include_in_pdf?) || lessons.any? {|l| l.resources.any?(&:should_include_in_pdf?)}
      Services::CurriculumPdfs.get_unit_resources_url(self)
    end
  end

  # To help teachers have more control over the pacing of certain scripts, we
  # send students on the last level of a lesson to the unit overview page.
  def show_unit_overview_between_lessons?
    middle_high? || ['vpl-csd-summer-pilot'].include?(get_course_version&.course_offering&.key)
  end

  private def teacher_feedback_enabled?
    initiative = get_course_version&.course_offering&.marketing_initiative
    TEACHER_FEEDBACK_INITIATIVES.include? initiative
  end
end

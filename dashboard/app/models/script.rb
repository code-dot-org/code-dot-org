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
#
# Indexes
#
#  index_scripts_on_name             (name) UNIQUE
#  index_scripts_on_wrapup_video_id  (wrapup_video_id)
#

require 'cdo/script_constants'
require 'cdo/shared_constants'

# A sequence of Levels
class Script < ActiveRecord::Base
  include ScriptConstants
  include SharedConstants

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

  attr_accessor :skip_name_format_validation
  include SerializedToFileValidation

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
  SCRIPT_CACHE_KEY = 'script-cache'

  # Caching is disabled when editing scripts and levels or running unit tests.
  def self.should_cache?
    return false if Rails.application.config.levelbuilder_mode
    return false if ENV['UNIT_TEST'] || ENV['CI']
    true
  end

  def self.script_cache_to_cache
    Rails.cache.write(SCRIPT_CACHE_KEY, script_cache_from_db)
  end

  def self.script_cache_from_cache
    Script.connection
    [
      ScriptLevel, Level, Game, Concept, Callout, Video, Artist, Blockly
    ].each(&:new) # make sure all possible loaded objects are completely loaded
    Rails.cache.read SCRIPT_CACHE_KEY
  end

  def self.script_cache_from_db
    {}.tap do |cache|
      Script.all.pluck(:id).each do |script_id|
        script = Script.includes(
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
            }
          ]
        ).find(script_id)

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
    self.class.get_from_cache(id)
  end

  def self.get_without_cache(id)
    # a bit of trickery so we support both ids which are numbers and
    # names which are strings that may contain numbers (eg. 2-3)
    find_by = (id.to_i.to_s == id.to_s) ? :id : :name
    Script.find_by(find_by => id).tap do |s|
      raise ActiveRecord::RecordNotFound.new("Couldn't find Script with id|name=#{id}") unless s
    end
  end

  def self.get_from_cache(id)
    return get_without_cache(id) unless should_cache?

    script_cache.fetch(id.to_s) do
      # Populate cache on miss.
      script_cache[id.to_s] = get_without_cache(id)
    end
  end

  def text_response_levels
    return @text_response_levels if Script.should_cache? && @text_response_levels
    @text_response_levels = text_response_levels_without_cache
  end

  def text_response_levels_without_cache
    text_response_levels = []
    script_levels.map do |script_level|
      script_level.levels.map do |level|
        next if level.contained_levels.empty?
        text_response_levels << {
          script_level: script_level,
          levels: [level.contained_levels.first]
        }
      end
    end

    text_response_levels.concat(
      script_levels.includes(:levels).
        where('levels.type' => [TextMatch, FreeResponse]).
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

  def get_script_level_by_id(script_level_id)
    script_levels.find {|sl| sl.id == script_level_id.to_i}
  end

  def get_script_level_by_relative_position_and_puzzle_position(relative_position, puzzle_position, lockable)
    relative_position ||= 1
    script_levels.to_a.find do |sl|
      sl.stage.lockable? == lockable && sl.stage.relative_position == relative_position.to_i && sl.position == puzzle_position.to_i
    end
  end

  def get_script_level_by_chapter(chapter)
    chapter = chapter.to_i
    return nil if chapter < 1 || chapter > script_levels.to_a.size
    script_levels[chapter - 1] # order is by chapter
  end

  def beta?
    Script.beta? name
  end

  def self.beta?(name)
    name == 'edit-code' || name == 'coursea-draft' || name == 'courseb-draft' || name == 'coursec-draft' || name == 'coursed-draft' || name == 'coursee-draft' || name == 'coursef-draft' || name.start_with?('csd')
  end

  private def k1?
    [
      Script::COURSEA_DRAFT_NAME,
      Script::COURSEB_DRAFT_NAME,
      Script::COURSE1_NAME
    ].include?(name)
  end

  def text_to_speech_enabled?
    k1? || name == Script::COURSEC_DRAFT_NAME
  end

  def hide_solutions?
    name == 'algebra'
  end

  def banner_image
    if has_banner?
      "banner_#{name}.jpg"
    end
  end

  def logo_image
    I18n.t(['data.script.name', name, 'logo_image'].join('.'), raise: true) rescue nil
  end

  def k5_course?
    %w(course1 course2 course3 course4).include? name
  end

  def k5_draft_course?
    %w(coursea-draft courseb-draft coursec-draft coursed-draft coursee-draft coursef-draft).include? name
  end

  def csf?
    k5_course? || twenty_hour?
  end

  def cs_in_a?
    name.match(Regexp.union('algebra', 'Algebra'))
  end

  def has_lesson_plan?
    k5_course? || k5_draft_course? || %w(msm algebra algebraa algebrab cspunit1 cspunit2 cspunit3 cspunit4 cspunit5 cspunit6 csp1 csp2 csp3 csp4 csp5 csp6 csppostap cspoptional csd1 csd2 csd3 csd4 csd5 csd6 csd1-old csd3-old text-compression netsim pixelation frequency_analysis vigenere).include?(name)
  end

  def has_banner?
    k5_course? || %w(csp1 csp2 csp3 cspunit1 cspunit2 cspunit3).include?(name)
  end

  def freeplay_links
    if cs_in_a?
      ['calc', 'eval']
    elsif name.start_with?('csp')
      ['applab']
    elsif name.start_with?('csd')
      []
    else
      ['playlab', 'artist']
    end
  end

  def has_peer_reviews?
    peer_reviews_to_complete.try(:>, 0)
  end

  def self.setup(custom_files)
    transaction do
      scripts_to_add = []

      custom_i18n = {}
      # Load custom scripts from Script DSL format
      custom_files.map do |script|
        name = File.basename(script, '.script')
        script_data, i18n = ScriptDSL.parse_file(script)

        stages = script_data[:stages]
        custom_i18n.deep_merge!(i18n)
        # TODO: below is duplicated in update_text. and maybe can be refactored to pass script_data?
        scripts_to_add << [{
          id: script_data[:id],
          name: name,
          hidden: script_data[:hidden].nil? ? true : script_data[:hidden], # default true
          login_required: script_data[:login_required].nil? ? false : script_data[:login_required], # default false
          wrapup_video: script_data[:wrapup_video],
          properties: Script.build_property_hash(script_data)
        }, stages.map {|stage| stage[:scriptlevels]}.flatten]
      end

      # Stable sort by ID then add each script, ensuring scripts with no ID end up at the end
      added_scripts = scripts_to_add.sort_by.with_index {|args, idx| [args[0][:id] || Float::INFINITY, idx]}.map do |args|
        add_script(*args)
      end
      [added_scripts, custom_i18n]
    end
  end

  def self.add_script(options, raw_script_levels)
    script = fetch_script(options)
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

        level = levels_by_key[key] || Level.find_by_key(key)

        if key.starts_with?('blockly')
          # this level is defined in levels.js. find/create the reference to this level
          level = Level.
            create_with(name: 'blockly').
            find_or_create_by!(Level.key_to_params(key))
          level = level.with_type(raw_level.delete(:type) || 'Blockly') if level.type.nil?
          level.update(raw_level)
        elsif raw_level[:video_key]
          level.update(video_key: raw_level[:video_key])
        end

        unless level
          raise ActiveRecord::RecordNotFound, "Level: #{raw_level_data.to_json}, Script: #{script.name}"
        end

        if [Game.applab, Game.gamelab].include? level.game
          unless script.hidden || script.login_required
            raise <<-ERROR.gsub(/^\s+/, '')
              Applab and Gamelab levels can only be added to scripts that are hidden or require login
              (while adding level "#{level.name}" to script "#{script.name}")
            ERROR
          end
        end
        level
      end

      stage_name = raw_script_level.delete(:stage)
      properties = raw_script_level.delete(:properties)

      script_level_attributes = {
        script_id: script.id,
        chapter: (chapter += 1),
        named_level: named_level,
        bonus: bonus,
        assessment: assessment
      }
      script_level_attributes[:properties] = properties.to_json if properties
      script_level = script.script_levels.detect do |sl|
        script_level_attributes.all? {|k, v| sl.send(k) == v} &&
          sl.levels == levels
      end || ScriptLevel.create(script_level_attributes) do |sl|
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

      if stage.lockable && stage.script_levels.length > 1
        raise 'Expect lockable stages to have a single script_level'
      end
    end

    script.stages = script_stages
    script.reload.stages
    script.generate_plc_objects

    script
  end

  # script is found/created by 'id' (if provided) otherwise by 'name'
  def self.fetch_script(options)
    options.symbolize_keys!
    options[:wrapup_video] = options[:wrapup_video].blank? ? nil : Video.find_by!(key: options[:wrapup_video])
    name = {name: options.delete(:name)}
    script_key = ((id = options.delete(:id)) && {id: id}) || name
    script = Script.includes(:levels, :script_levels, stages: :script_levels).create_with(name).find_or_create_by(script_key)
    script.update!(options.merge(skip_name_format_validation: true))
    script
  end

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
            properties: Script.build_property_hash(general_params)
          },
          script_data[:stages].map {|stage| stage[:scriptlevels]}.flatten
        )
        Script.merge_and_write_i18n(i18n, script_name, metadata_i18n)
      end
    rescue StandardError => e
      errors.add(:base, e.to_s)
      return false
    end
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
      # unlike stages_i18n, we don't expect meta_i18n to have the full tree
      metadata_i18n = {'en' => {'data' => {'script' => {'name' => {script_name => metadata_i18n.to_h}}}}}
    end

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

  def summarize(include_stages=true)
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

    summary = {
      id: id,
      name: name,
      hidden: hidden,
      loginRequired: login_required,
      plc: professional_learning_course?,
      hideable_stages: hideable_stages?,
      disablePostMilestone: disable_post_milestone?,
      isHocScript: hoc?,
      peerReviewsRequired: peer_reviews_to_complete || 0,
      peerReviewStage: peer_review_stage,
      student_detail_progress_view: student_detail_progress_view?
    }

    summary[:stages] = stages.map(&:summarize) if include_stages

    summary[:professionalLearningCourse] = professional_learning_course if professional_learning_course?
    summary[:wrapupVideo] = wrapup_video.key if wrapup_video

    summary
  end

  # Similar to summarize, but returns an even more narrow set of fields, restricted
  # to those needed in header.html.haml
  def summarize_header
    {
      name: name,
      disablePostMilestone: disable_post_milestone?,
      isHocScript: hoc?,
      student_detail_progress_view: student_detail_progress_view?
    }
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

  def self.clear_cache
    # only call this in a test!
    @@script_cache = nil
  end

  def localized_title
    I18n.t "data.script.name.#{name}.title"
  end

  def disable_post_milestone?
    !Gatekeeper.allows('postMilestone', where: {script_name: name}, default: true)
  end

  def self.build_property_hash(script_data)
    {
      hideable_stages: script_data[:hideable_stages] || false, # default false
      professional_learning_course: script_data[:professional_learning_course] || false, # default false
      peer_reviews_to_complete: script_data[:peer_reviews_to_complete] || nil,
      student_detail_progress_view: script_data[:student_detail_progress_view] || false
    }.compact
  end
end

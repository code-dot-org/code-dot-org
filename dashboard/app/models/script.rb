# == Schema Information
#
# Table name: scripts
#
#  id              :integer          not null, primary key
#  name            :string(255)      not null
#  created_at      :datetime
#  updated_at      :datetime
#  wrapup_video_id :integer
#  trophies        :boolean          default(FALSE), not null
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

# A sequence of Levels
class Script < ActiveRecord::Base
  include ScriptConstants

  include Seeded
  has_many :levels, through: :script_levels
  has_many :script_levels, -> { order('chapter ASC') }, dependent: :destroy, inverse_of: :script # all script levels, even those w/ stages, are ordered by chapter, see Script#add_script
  has_many :stages, -> { order('position ASC') }, dependent: :destroy, inverse_of: :script
  has_many :users, through: :user_scripts
  has_many :user_scripts
  has_many :hint_view_requests
  belongs_to :wrapup_video, foreign_key: 'wrapup_video_id', class_name: 'Video'
  belongs_to :user
  validates :name, presence: true, uniqueness: { case_sensitive: false}

  include SerializedProperties

  serialized_attrs %w(pd admin_required)

  def Script.twenty_hour_script
    Script.get_from_cache(Script::TWENTY_HOUR_NAME)
  end

  def Script.hoc_2014_script
    Script.get_from_cache(Script::HOC_NAME)
  end

  def Script.starwars_script
    Script.get_from_cache(Script::STARWARS_NAME)
  end

  def Script.minecraft_script
    Script.get_from_cache(Script::MINECRAFT_NAME)
  end

  def Script.starwars_blocks_script
    Script.get_from_cache(Script::STARWARS_BLOCKS_NAME)
  end

  def Script.frozen_script
    Script.get_from_cache(Script::FROZEN_NAME)
  end

  def Script.course1_script
    Script.get_from_cache(Script::COURSE1_NAME)
  end

  def Script.course2_script
    Script.get_from_cache(Script::COURSE2_NAME)
  end

  def Script.course3_script
    Script.get_from_cache(Script::COURSE3_NAME)
  end

  def Script.course4_script
    Script.get_from_cache(Script::COURSE4_NAME)
  end

  def Script.infinity_script
    Script.get_from_cache(Script::INFINITY_NAME)
  end

  def Script.flappy_script
    Script.get_from_cache(Script::FLAPPY_NAME)
  end

  def Script.playlab_script
    Script.get_from_cache(Script::PLAYLAB_NAME)
  end

  def Script.artist_script
    Script.get_from_cache(Script::ARTIST_NAME)
  end

  def starting_level
    raise "Script #{name} has no level to start at" if script_levels.empty?
    candidate_level = script_levels.first.or_next_progression_level
    raise "Script #{name} has no valid progression levels (non-unplugged) to start at" unless candidate_level
    candidate_level
  end

  # For all scripts, cache all related information (levels, etc),
  # indexed by both id and name. This is cached both in a class
  # variable (ie. in memory in the worker process) and in a
  # distributed cache (Rails.cache)
  @@script_cache = nil
  SCRIPT_CACHE_KEY = 'script-cache'

  # Caching is disabled when editing scripts and levels.
  def self.should_cache?
    !Rails.application.config.levelbuilder_mode
  end

  def self.script_cache_to_cache
    Rails.cache.write(SCRIPT_CACHE_KEY, script_cache_from_db)
  end

  def self.script_cache_from_cache
    Script.connection
    [ScriptLevel, Level, Game, Concept, Callout, Video,
     Artist, Blockly].each(&:new) # make sure all possible loaded objects are completely loaded
    Rails.cache.read SCRIPT_CACHE_KEY
  end

  def self.script_cache_from_db
    {}.tap do |cache|
      Script.all.pluck(:id).each do |script_id|
        script = Script.includes([{script_levels: [{levels: [:game, :concepts] }, :stage, :callouts]}, :stages]).find(script_id)

        cache[script.name] = script
        cache[script.id.to_s] = script
      end
    end
  end

  def self.script_cache
    return nil unless self.should_cache?
    @@script_cache ||=
      script_cache_from_cache || script_cache_from_db
  end

  # Returns a cached map from script level id to id, or nil if in level_builder mode
  # which disables caching.
  def self.script_level_cache
    return nil unless self.should_cache?
    @@script_level_cache ||= {}.tap do |cache|
      script_cache.values.each do |script|
        cache.merge!(script.script_levels.index_by(&:id))
      end
    end
  end

  # Returns a cached map from level id to id, or nil if in level_builder mode
  # which disables caching.
  def self.level_cache
    return nil unless self.should_cache?
    @@level_cache ||= {}.tap do |cache|
      script_level_cache.values.each do |script_level|
        level = script_level.level
        next unless level
        cache[level.id] = level unless cache.has_key? level.id
      end
    end
  end

  # Find the script level with the given id from the cache, unless the level build mode
  # is enabled in which case  it is always fetched from the database. If we need to fetch
  # the script and we're not in level mode (for example because the script was created after
  # the cache), then an entry for the script is added to the cache.
  def self.cache_find_script_level(script_level_id)
    script_level = script_level_cache[script_level_id] if self.should_cache?

    # If the cache missed or we're in levelbuilder mode, fetch the script level from the db.
    if script_level.nil?
      script_level = ScriptLevel.find(script_level_id)
      # Cache the script level, unless it wasn't found.
      @@script_level_cache[script_level_id] = script_level if script_level && self.should_cache?
    end
    script_level
  end

  # Find the level with the given id from the cache, unless the level build mode
  # is enabled in which case it is always fetched from the database. If we need to fetch
  # the level and we're not in level mode (for example because the level was created after
  # the cache), then an entry for the level is added to the cache.
  def self.cache_find_level(level_id)
    level = level_cache[level_id] if self.should_cache?

    # If the cache missed or we're in levelbuilder mode, fetch the level from the db.
    if level.nil?
      level = Level.find(level_id)
      # Cache the level, unless it wasn't found.
      @@level_cache[level_id] = level if level && self.should_cache?
    end
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
    return get_without_cache(id) unless self.should_cache?

    self.script_cache[id.to_s] || get_without_cache(id)
  end

  def to_param
    name
  end

  # Legacy levels have different video and title logic in LevelsHelper.
  def legacy_curriculum?
    [TWENTY_HOUR_NAME, HOC_2013_NAME, EDIT_CODE_NAME, TWENTY_FOURTEEN_NAME, FLAPPY_NAME, JIGSAW_NAME].include? self.name
  end

  def twenty_hour?
    ScriptConstants.twenty_hour?(self.name)
  end

  def hoc?
    ScriptConstants.hoc?(self.name)
  end

  def flappy?
    ScriptConstants.flappy?(self.name)
  end

  def minecraft?
    ScriptConstants.minecraft?(self.name)
  end

  def find_script_level(level_id)
    self.script_levels.detect { |sl| sl.level_id == level_id }
  end

  def get_script_level_by_id(script_level_id)
    self.script_levels.find { |sl| sl.id == script_level_id.to_i }
  end

  def get_script_level_by_stage_and_position(stage_position, puzzle_position)
    stage_position ||= 1
    self.script_levels.to_a.find do |sl|
      sl.stage.position == stage_position.to_i && sl.position == puzzle_position.to_i
    end
  end

  def get_script_level_by_chapter(chapter)
    chapter = chapter.to_i
    return nil if chapter < 1 || chapter > self.script_levels.to_a.size
    self.script_levels[chapter - 1] # order is by chapter
  end

  def beta?
    Script.beta? name
  end

  def self.beta?(name)
    name == 'course4' || name == 'edit-code' || name == 'cspunit1' || name == 'cspunit2' || name == 'cspunit3' || name == 'cspunit4' || name == 'cspunit5'
  end

  def is_k1?
    name == 'course1'
  end

  def hide_solutions?
    name == 'algebra'
  end

  def banner_image
    if has_banner?
      "banner_#{name}_cropped.png"
    end
  end

  def logo_image
    I18n.t(['data.script.name', name, 'logo_image'].join('.'), raise: true) rescue nil
  end

  def k5_course?
    %w(course1 course2 course3 course4).include? self.name
  end

  def csf?
    k5_course? || twenty_hour?
  end

  def show_report_bug_link?
    beta? || k5_course?
  end

  def has_lesson_plan?
    k5_course? || %w(msm algebra cspunit1 cspunit2 cspunit3 cspunit4 cspunit5).include?(self.name)
  end

  def has_banner?
    k5_course? || %w(cspunit1 cspunit2 cspunit3).include?(self.name)
  end

  def freeplay_links
    if name.include?('algebra')
      ['calc', 'eval']
    elsif name.start_with?('csp')
      ['applab']
    else
      ['playlab', 'artist']
    end

  end

  SCRIPT_CSV_MAPPING = %w(Game Name Level:level_num Skin Concepts Url:level_url Stage)
  SCRIPT_MAP = Hash[SCRIPT_CSV_MAPPING.map { |x| x.include?(':') ? x.split(':') : [x, x.downcase] }]

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
          trophies: script_data[:trophies],
          hidden: script_data[:hidden].nil? ? true : script_data[:hidden], # default true
          login_required: script_data[:login_required].nil? ? false : script_data[:login_required], # default false
          wrapup_video: script_data[:wrapup_video],
          properties: {
                       pd: script_data[:pd].nil? ? false : script_data[:pd], # default false
                       admin_required: script_data[:admin_required].nil? ? false : script_data[:admin_required], # default false
                      },
        }, stages.map{|stage| stage[:levels]}.flatten]
      end

      # Stable sort by ID then add each script, ensuring scripts with no ID end up at the end
      added_scripts = scripts_to_add.sort_by.with_index{ |args, idx| [args[0][:id] || Float::INFINITY, idx] }.map do |args|
        add_script(*args)
      end
      [added_scripts, custom_i18n]
    end
  end

  def self.add_script(options, data)
    script = fetch_script(options)
    chapter = 0
    stage_position = 0; script_level_position = Hash.new(0)
    script_stages = []
    script_levels_by_stage = {}
    levels_by_key = script.levels.index_by(&:key)

    # Overwrites current script levels
    script.script_levels = data.map do |row|
      row.symbolize_keys!

      # Concepts are comma-separated, indexed by name
      row[:concept_ids] = (concepts = row.delete(:concepts)) && concepts.split(',').map(&:strip).map do |concept_name|
        (Concept.by_name(concept_name) || raise("missing concept '#{concept_name}'"))
      end

      row_data = row.dup
      stage_name = row.delete(:stage)
      assessment = row.delete(:assessment)

      key = row.delete(:name)

      if row[:level_num] && !key.starts_with?('blockly')
        # a levels.js level in a old style script -- give it the same key that we use for levels.js levels in new style scripts
        key = ['blockly', row.delete(:game), row.delete(:level_num)].join(':')
      end

      level = levels_by_key[key] || Level.find_by_key(key)

      if key.starts_with?('blockly')
        # this level is defined in levels.js. find/create the reference to this level
        level = Level.
          create_with(name: 'blockly').
          find_or_create_by!(Level.key_to_params(key))
        level = level.with_type(row.delete(:type) || 'Blockly') if level.type.nil?
        level.update(row)
      elsif row[:video_key]
        level.update(video_key: row[:video_key])
      end

      unless level
        raise ActiveRecord::RecordNotFound, "Level: #{row_data.to_json}, Script: #{script.name}"
      end

      if level.game && (level.game == Game.applab || level.game == Game.gamelab) && !script.hidden && !script.login_required
        raise 'Applab/Gamelab levels can only be added to a script that requires login'
      end

      script_level_attributes = {
        script_id: script.id,
        chapter: (chapter += 1),
        assessment: assessment
      }
      script_level = script.script_levels.detect{|sl|
        script_level_attributes.all?{ |k, v| sl.send(k) == v } &&
          sl.levels == [level]
      } || ScriptLevel.create(script_level_attributes) {|sl|
        sl.levels = [level]
      }
      # Set/create Stage containing custom ScriptLevel
      if stage_name
        stage = script.stages.detect{|s| s.name == stage_name} ||
          Stage.find_or_create_by(
            name: stage_name,
            script: script
          )
        script_level_attributes[:stage_id] = stage.id
        script_level_attributes[:position] = (script_level_position[stage.id] += 1)
        script_level.reload
        script_level.assign_attributes(script_level_attributes)
        script_level.save! if script_level.changed?
        (script_levels_by_stage[stage.id] ||= []) << script_level
        unless script_stages.include?(stage)
          stage.assign_attributes(position: (stage_position += 1))
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
    end

    script.stages = script_stages
    script.reload.stages
    script
  end

  # script is found/created by 'id' (if provided) otherwise by 'name'
  def self.fetch_script(options)
    options.symbolize_keys!
    v = :wrapup_video; options[v] = Video.find_by(key: options[v]) if options.has_key? v
    name = {name: options.delete(:name)}
    script_key = ((id = options.delete(:id)) && {id: id}) || name
    script = Script.includes(:levels, :script_levels, stages: :script_levels).create_with(name).find_or_create_by(script_key)
    script.update!(options)
    script
  end

  def update_text(script_params, script_text)
    begin
      transaction do
        script_data, i18n = ScriptDSL.parse(script_text, 'input', script_params[:name])
        Script.add_script({
          name: script_params[:name],
          trophies: script_data[:trophies],
          hidden: script_data[:hidden].nil? ? true : script_data[:hidden], # default true
          login_required: script_data[:login_required].nil? ? false : script_data[:login_required], # default false
          wrapup_video: script_data[:wrapup_video],
          properties: {
                       pd: script_data[:pd].nil? ? false : script_data[:pd], # default false
                       admin_required: script_data[:admin_required].nil? ? false : script_data[:admin_required], # default false
          }
        }, script_data[:stages].map { |stage| stage[:levels] }.flatten)
        Script.update_i18n(i18n)
      end
    rescue StandardError => e
      errors.add(:base, e.to_s)
      return false
    end
    begin
      # write script to file
      filename = "config/scripts/#{script_params[:name]}.script"
      File.write(filename, script_text)
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

  def self.update_i18n(custom_i18n)
    scripts_yml = File.expand_path('config/locales/scripts.en.yml')
    i18n = File.exist?(scripts_yml) ? YAML.load_file(scripts_yml) : {}
    i18n.deep_merge!(custom_i18n){|_, old, _| old} # deep reverse merge
    File.write(scripts_yml, "# Autogenerated scripts locale file.\n" + i18n.to_yaml(line_width: -1))
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

  def summarize
    summary = {
      id: id,
      name: name,
      stages: stages.map(&:summarize),
    }

    summary[:trophies] = Concept.summarize_all if trophies

    summary
  end

  def self.clear_cache
    # only call this in a test!
    @@script_cache = nil
  end

  def localized_title
    I18n.t "data.script.name.#{name}.title"
  end
end

# A sequence of Levels
class Script < ActiveRecord::Base
  include Seeded
  has_many :levels, through: :script_levels
  has_many :script_levels, -> { order('chapter ASC') }, dependent: :destroy, inverse_of: :script # all script levels, even those w/ stages, are ordered by chapter, see Script#add_script
  has_many :stages, -> { order('position ASC') }, dependent: :destroy, inverse_of: :script
  belongs_to :wrapup_video, foreign_key: 'wrapup_video_id', class_name: 'Video'
  belongs_to :user
  validates :name, presence: true, uniqueness: { case_sensitive: false}

  # Names used throughout the code
  HOC_2013_NAME = 'Hour of Code' # this is the old (2013) hour of code
  EDIT_CODE_NAME = 'edit-code'
  TWENTY_FOURTEEN_NAME = 'events'
  JIGSAW_NAME = 'jigsaw'

  HOC_NAME = 'hourofcode' # name of the new (2014) hour of code script
  FROZEN_NAME = 'frozen'
  PLAYLAB_NAME = 'playlab'

  FLAPPY_NAME = 'flappy'
  TWENTY_HOUR_NAME = '20-hour'

  COURSE1_NAME = 'course1'
  COURSE2_NAME = 'course2'
  COURSE3_NAME = 'course3'
  COURSE4_NAME = 'course4'

  def Script.twenty_hour_script
    Script.get_from_cache(Script::TWENTY_HOUR_NAME)
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
        script = Script.includes([{script_levels: [{level: [:game, :concepts] }, :stage, :callouts]}, :stages]).find(script_id)

        cache[script.name] = script
        cache[script.id.to_s] = script
      end
    end
  end

  def self.script_cache
    @@script_cache ||=
      script_cache_from_cache || script_cache_from_db
  end

  def cached
    self.class.get_from_cache(id)
  end

  def self.get_from_cache(id)
    if !Rails.env.levelbuilder? && self.script_cache[id.to_s]
      self.script_cache[id.to_s]
    else
      # a bit of trickery so we support both ids which are numbers and
      # names which are strings that may contain numbers (eg. 2-3)
      find_by = (id.to_i.to_s == id.to_s) ? :id : :name
      Script.find_by(find_by => id).tap do |s|
        raise ActiveRecord::RecordNotFound.new("Couldn't find Script with id|name=#{id}") unless s
      end
    end
  end

  def to_param
    name
  end

  # Legacy levels have different video and title logic in LevelsHelper.
  def legacy_curriculum?
    [TWENTY_HOUR_NAME, HOC_2013_NAME, EDIT_CODE_NAME, TWENTY_FOURTEEN_NAME, FLAPPY_NAME, JIGSAW_NAME].include? self.name
  end

  def twenty_hour?
    self.name == TWENTY_HOUR_NAME
  end

  def hoc?
    # Note that now multiple scripts can be an 'hour of code' script.
    [HOC_2013_NAME, HOC_NAME, FROZEN_NAME, FLAPPY_NAME, PLAYLAB_NAME].include? self.name
  end

  def flappy?
    self.name == FLAPPY_NAME
  end

  def find_script_level(level_id)
    self.script_levels.detect { |sl| sl.level_id == level_id }
  end

  def get_script_level_by_id(script_level_id)
    self.script_levels.select { |sl| sl.id == script_level_id.to_i }.first
  end

  def get_script_level_by_stage_and_position(stage_position, puzzle_position)
    stage_position ||= 1
    self.script_levels.to_a.find do |sl|
      sl.stage.position == stage_position.to_i && sl.position == puzzle_position.to_i
    end
  end

  def get_script_level_by_chapter(chapter)
    chapter = chapter.to_i
    return nil if chapter < 1 || chapter > self.script_levels.count
    self.script_levels[chapter - 1] # order is by chapter
  end

  def feedback_url
    feedback_url_keys = {
      course1: 'RJH5D5F',
      course2: 'H8JLN38',
      course3: '6T8NZY5',
    }
    feedback_url_key = feedback_url_keys[self.name.to_sym]
    "https://www.surveymonkey.com/s/#{feedback_url_key}" if feedback_url_key
  end

  def beta?
    Script.beta? name
  end

  def self.beta?(name)
    name == 'course4' || name == 'edit-code'
  end

  def is_k1?
    name == 'course1'
  end

  def banner_image
    if k5_course?
      "banner_#{name}_cropped.jpg"
    end
  end

  def logo_image
    I18n.t(['data.script.name', name, 'logo_image'].join('.'), raise: true) rescue nil
  end

  def k5_course?
    %w(course1 course2 course3 course4).include? self.name
  end

  def show_report_bug_link?
    beta? || k5_course?
  end

  def has_lesson_plan?
    k5_course? || %w(msm algebra).include?(self.name)
  end

  def show_freeplay_links?
    name != 'algebra'
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
          name: name,
          trophies: script_data[:trophies],
          hidden: script_data[:hidden].nil? ? true : script_data[:hidden], # default true
          login_required: script_data[:login_required].nil? ? false : script_data[:login_required], # default false
          wrapup_video: script_data[:wrapup_video],
          id: script_data[:id],
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
      end

      unless level
        raise ActiveRecord::RecordNotFound, "Level: #{row_data.to_json}, Script: #{script.name}"
      end

      script_level_attributes = {
        script_id: script.id,
        level_id: level.id,
        chapter: (chapter += 1),
        assessment: assessment
      }
      script_level = script.script_levels.detect{|sl|
        script_level_attributes.all?{ |k, v| sl.send(k) == v }
      } || ScriptLevel.find_or_create_by(script_level_attributes)
      # Set/create Stage containing custom ScriptLevel
      if stage_name
        stage = script.stages.detect{|s| s.name == stage_name} ||
          Stage.find_or_create_by(
            name: stage_name,
            script: script
          )
        script_level_attributes.merge!(
          stage_id: stage.id,
          position: (script_level_position[stage.id] += 1)
        )
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
          hidden: script_data[:hidden].nil? ? true : script_data[:hidden],
          login_required: script_data[:login_required].nil? ? false : script_data[:login_required], # default false
          wrapup_video: script_data[:wrapup_video],
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
end

# A sequence of Levels
class Script < ActiveRecord::Base
  include Seeded
  has_many :levels, through: :script_levels
  has_many :script_levels, -> { order('chapter ASC') }, dependent: :destroy # all script levels, even those w/ stages, are ordered by chapter, see Script#add_script
  has_many :stages, -> { order('position ASC') }, dependent: :destroy
  belongs_to :wrapup_video, foreign_key: 'wrapup_video_id', class_name: 'Video'
  belongs_to :user
  validates :name, presence: true, uniqueness: { case_sensitive: false}

  # Hardcoded scriptID constants used throughout the code
  TWENTY_HOUR_ID = 1
  HOC_ID = 2
  EDIT_CODE_ID = 3
  TWENTY_FOURTEEN_LEVELS_ID = 4
  BUILDER_ID = 5
  FLAPPY_ID = 6
  JIGSAW_ID = 7

  MAX_DEFAULT_LEVEL_ID = 8

  def self.twenty_hour_script
    @@twenty_hour_script ||= Script.includes(script_levels: { level: [:game, :concepts] }).find(TWENTY_HOUR_ID)
  end

  def self.hoc_script
    @@hoc_script ||= Script.includes(script_levels: { level: [:game, :concepts] }).find(HOC_ID)
  end

  def starting_level
    raise "Script #{name} has no level to start at" if script_levels.empty?
    candidate_level = script_levels.first.or_next_progression_level
    raise "Script #{name} has no valid progression levels (non-unplugged) to start at" unless candidate_level
    candidate_level
  end

  def self.get_from_cache(id)
    case id
    when TWENTY_HOUR_ID then twenty_hour_script
    when HOC_ID then hoc_script
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
    if self.twenty_hour? || self.hoc?
      super
    else
      name
    end
  end

  def script_levels_from_game(game_id)
    self.script_levels.includes(:script).joins(:level).where(levels: {game_id: game_id})
  end

  def multiple_games?
    # simplified check to see if we are in a script that has only one game (stage)
    stages.many? ||
      (stages.empty? && levels.first.game_id != levels.last.game_id)
  end

  def legacy_curriculum?
    twenty_hour? || hoc? || flappy?
  end

  def twenty_hour?
    self.id == TWENTY_HOUR_ID
  end

  def hoc?
    self.id == HOC_ID
  end

  def flappy?
    self.id == FLAPPY_ID
  end

  def default_script?
    self.id <= MAX_DEFAULT_LEVEL_ID
  end

  def find_script_level(level_id)
    self.script_levels.detect { |sl| sl.level_id == level_id }
  end

  def self.twenty_hour_script
    Script.find(TWENTY_HOUR_ID)
  end

  def self.builder_script
    Script.find(BUILDER_ID)
  end

  def get_script_level_by_id(script_level_id)
    script_level_id = script_level_id.to_i
    self.script_levels.select { |sl| sl.id == script_level_id }.first
  end

  def get_script_level_by_stage_and_position(stage_position, puzzle_position)
    self.stages.find_by(position: stage_position).script_levels.find_by(position: puzzle_position)
  end

  def get_script_level_by_chapter(chapter)
    chapter = chapter.to_i
    self.script_levels.select { |sl| sl.chapter == chapter }.first
  end

  def feedback_url
    feedback_url_keys = { "course1"=>"RJH5D5F", "course2"=>"H8JLN38", "course3"=>"6T8NZY5" }
    feedback_url_key = feedback_url_keys[self.name]
    "https://www.surveymonkey.com/s/" + feedback_url_key if feedback_url_key
  end

  def beta?
    false
  end

  def is_k1?
    name == 'course1'
  end

  def has_banner_image?
    k5_course?
  end

  def k5_course?
    return ['course1', 'course2', 'course3'].include? self.name
  end

  SCRIPT_CSV_MAPPING = %w(Game Name Level:level_num Skin Concepts Url:level_url Stage)
  SCRIPT_MAP = Hash[SCRIPT_CSV_MAPPING.map { |x| x.include?(':') ? x.split(':') : [x, x.downcase] }]

  def self.setup(default_files, custom_files)
    transaction do
      # Load default scripts from yml (csv embedded)
      default_scripts = default_files.map { |yml| load_yaml(yml, SCRIPT_MAP) }
      .sort_by { |options, _| options['id'] }
      .map { |options, data| add_script(options, data) }

      custom_i18n = {}
      # Load custom scripts from Script DSL format
      custom_scripts = custom_files.map do |script|
        script_data, i18n = ScriptDSL.parse_file(script)
        stages = script_data[:stages]
        custom_i18n.deep_merge!(i18n)
        add_script({name: File.basename(script, '.script'),
                    trophies: false,
                    hidden: script_data[:hidden].nil? ? true : script_data[:hidden]},
                   stages.map{|stage| stage[:levels]}.flatten)
      end
      Rails.cache.clear
      [(default_scripts + custom_scripts), custom_i18n]
    end
  end

  def self.add_script(options, data)
    script = fetch_script(options)
    chapter = 0; game_chapter = Hash.new(0)
    stage_position = 0; script_level_position = Hash.new(0)
    script_stages = []
    script_levels_by_stage = {}
    levels_by_name = script.levels.index_by(&:name)
    levels_by_num = script.levels.index_by do |level|
      "#{level.game_id} #{level.level_num}"
    end

    # Overwrites current script levels
    script.script_levels = data.map do |row|
      row.symbolize_keys!

      # Concepts are comma-separated, indexed by name
      row[:concept_ids] = (concepts = row.delete(:concepts)) && concepts.split(',').map(&:strip).map do |concept_name|
        (Concept.by_name(concept_name) || raise("missing concept '#{concept_name}'"))
      end

      if row[:name].try(:start_with?, 'blockly:')
        row[:name], row[:game], row[:level_num] = row.delete(:name).split(':')
      end
      row_data = row.dup
      stage_name = row.delete(:stage)
      assessment = row.delete(:assessment)
      begin
        # if :level_num is present, find/create the reference to the Blockly level.
        if row[:level_num]
          key = {game_id: Game.by_name(row.delete(:game)), level_num: row.delete(:level_num)}
          level = levels_by_num["#{key[:game_id]} #{key[:level_num]}"] ||
          Level.includes(:concepts).create_with(name: row.delete(:name)).find_or_create_by!(key)
          row[:type] ||= 'Blockly'
        else
          name = row.delete(:name)
          level = levels_by_name[name] ||
            Level.find_by(name: name) ||
            raise(ActiveRecord::RecordNotFound)
        end
      rescue ActiveRecord::RecordNotFound => e
        raise e, "#{$!}, Level: #{row_data.to_json}, Script: #{script.name}", e.backtrace
      end

      level = level.with_type(row.delete(:type)) if level.type.nil?
      level.update(row) if row_data[:level_num]

      script_level_attributes = {
        script_id: script.id,
        level_id: level.id,
        chapter: (chapter += 1),
        game_chapter: (game_chapter[level.game_id] += 1),
        assessment: assessment
      }
      script_level = script.script_levels.detect{ |sl|
        script_level_attributes.all?{ |k, v| sl.send(k) == v }
      } || ScriptLevel.find_or_create_by(script_level_attributes)
      # Set/create Stage containing custom ScriptLevel
      if stage_name
        stage = script.stages.detect{|stage| stage.name == stage_name} ||
          Stage.find_or_create_by(
            name: stage_name,
            script: script
          )
        script_level_attributes.merge!(
          stage_id: stage.id,
          position: (script_level_position[stage] += 1)
        )
        (script_levels_by_stage[stage] ||= []) << script_level
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
      stage.script_levels = script_levels_by_stage[stage]
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
        Script.add_script({name: script_params[:name],
                           trophies: false,
                           hidden: script_data[:hidden].nil? ? true : script_data[:hidden]},
          script_data[:stages].map { |stage| stage[:levels] }.flatten)
        Script.update_i18n(i18n)
      end
    rescue Exception => e
      errors.add(:base, e.to_s)
      return false
    end
    begin
      # write script to file
      filename = "config/scripts/#{script_params[:name]}.script"
      File.write(filename, script_text)
      true
    rescue Exception => e
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
    i18n = File.exists?(scripts_yml) ? YAML.load_file(scripts_yml) : {}
    i18n.deep_merge!(custom_i18n) { |i, old, new| old } # deep reverse merge
    File.write(scripts_yml, "# Autogenerated scripts locale file.\n" + i18n.to_yaml)
  end

end

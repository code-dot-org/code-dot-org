class ScriptDSL < BaseDSL
  def initialize
    super
    @id = nil
    @title = nil
    @description_short = nil
    @description = nil
    @description_audience = nil
    @stage = nil
    @concepts = []
    @skin = nil
    @levels = []
    @stages = []
    @i18n_strings = Hash.new({})
    @video_key_for_next_level = nil
    @hidden = true
    @login_required = false
    @admin_required = false
    @trophies = false
    @pd = false
    @wrapup_video = nil
  end

  integer :id
  string :title
  string :description_short
  string :description
  string :description_audience

  boolean :hidden
  boolean :login_required
  boolean :admin_required
  boolean :trophies
  boolean :pd

  string :wrapup_video

  def stage(name)
    @stages << {stage: @stage, levels: @levels} if @stage
    @stage = name
    @levels = []
    @concepts = []
    @skin = nil
  end

  def parse_output
    stage(nil)
    {id: @id, stages: @stages, hidden: @hidden, trophies: @trophies, wrapup_video: @wrapup_video, login_required: @login_required, admin_required: @admin_required, pd: @pd}
  end

  def concepts(*items)
    @concepts = items
  end

  def level_concept_difficulty(json)
    @level_concept_difficulty = json ? JSON.parse(json) : {}
  end

  string :skin

  string :video_key_for_next_level

  def assessment(name)
    level(name, {assessment: true})
  end

  def level(name, properties = {})
    @levels << {
      :name => name,
      :stage => @stage,
      :skin => @skin,
      :concepts => @concepts.join(','),
      :level_concept_difficulty => @level_concept_difficulty || {},
      :video_key => @video_key_for_next_level
    }.merge(properties).select{|_, v| v.present? }
    @video_key_for_next_level = nil
  end

  def i18n_strings
    @i18n_strings['title'] = @title if @title
    @i18n_strings['description_short'] = @description_short if @description_short
    @i18n_strings['description'] = @description if @description
    @i18n_strings['description_audience'] = @description_audience if @description_audience
    @stages.each do |stage|
      @i18n_strings[stage[:stage]] = stage[:stage]
    end

    {'name'=> {@name => @i18n_strings}}
  end

  def self.parse_file(filename)
    super(filename, File.basename(filename, '.script'))
  end
end

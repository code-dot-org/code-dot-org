class ScriptDSL < BaseDSL
  def initialize
    super
    @id = nil
    @title = nil
    @description_short = nil
    @description = nil
    @description_audience = nil
    @stage = nil
    @stage_flex_category = nil
    @concepts = []
    @skin = nil
    @current_scriptlevel = nil
    @scriptlevels = []
    @stages = []
    @i18n_strings = Hash.new({})
    @video_key_for_next_level = nil
    @prompt = nil
    @hidden = true
    @login_required = false
    @admin_required = false
    @student_of_admin_required = false
    @trophies = false
    @pd = false
    @wrapup_video = nil
  end

  integer :id
  string :title
  string :description_short
  string :description
  string :description_audience
  string :professional_learning_course
  integer :peer_reviews_to_complete

  boolean :hidden
  boolean :login_required
  boolean :admin_required
  boolean :student_of_admin_required
  boolean :trophies
  boolean :pd

  string :wrapup_video

  def stage(name, flex = nil)
    @stages << {stage: @stage, scriptlevels: @scriptlevels} if @stage
    @stage = name
    @stage_flex_category = flex
    @scriptlevels = []
    @concepts = []
    @skin = nil
  end

  def parse_output
    stage(nil)
    {
      id: @id,
      stages: @stages,
      hidden: @hidden,
      trophies: @trophies,
      wrapup_video: @wrapup_video,
      login_required: @login_required,
      admin_required: @admin_required,
      pd: @pd,
      student_of_admin_required: @student_of_admin_required,
      professional_learning_course: @professional_learning_course,
      peer_reviews_to_complete: @peer_reviews_to_complete
    }
  end

  def concepts(*items)
    @concepts = items
  end

  def level_concept_difficulty(json)
    @level_concept_difficulty = json ? JSON.parse(json) : {}
  end

  string :skin

  string :video_key_for_next_level

  string :prompt

  def assessment(name)
    level(name, {assessment: true})
  end

  def named_level(name)
    level(name, {named_level: true})
  end

  def level(name, properties = {})
    active = properties.delete(:active)
    buttontext = properties.delete(:buttontext)
    imageurl = properties.delete(:imageurl)
    level_description = properties.delete(:description)
    level = {
      :name => name,
      :stage_flex_category => @stage_flex_category,
      :skin => @skin,
      :concepts => @concepts.join(','),
      :level_concept_difficulty => @level_concept_difficulty || {},
      :video_key => @video_key_for_next_level
    }.merge(properties).select{|_, v| v.present? }
    @video_key_for_next_level = nil
    if @current_scriptlevel
      @current_scriptlevel[:levels] << level

      levelprops = {}
      levelprops[:active] = active if active == false
      levelprops[:buttontext] = buttontext if buttontext
      levelprops[:imageurl] = imageurl if imageurl
      levelprops[:description] = level_description if level_description
      unless levelprops.empty?
        @current_scriptlevel[:properties][name] = levelprops
      end
    else
      @scriptlevels << {
        :stage => @stage,
        :levels => [level]
      }
    end
  end

  def variants
    @current_scriptlevel = { :levels => [], :properties => {}, :stage => @stage}
  end

  def endvariants
    @current_scriptlevel[:properties][:prompt] = @prompt if @prompt
    @scriptlevels << @current_scriptlevel

    @current_scriptlevel = nil
    @prompt = nil
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

class ScriptDSL < BaseDSL
  def initialize
    super
    @title = nil
    @description_short = nil
    @description = nil
    @stage = nil
    @concepts = []
    @skin = nil
    @levels = []
    @stages = []
    @i18n_strings = Hash.new({})
    @video_key_for_next_level = nil
    @hidden = true
  end

  def title(title)
    @title = title
  end

  def description_short(description_short)
    @description_short = description_short
  end

  def description(description)
    @description = description
  end

  def hidden(hidden_string)
    @hidden = ActiveRecord::ConnectionAdapters::Column::value_to_boolean(hidden_string)
  end

  def stage(name)
    @stages << {stage: @stage, levels: @levels} if @stage
    @stage = name
    @levels = []
    @concepts = []
    @skin = nil
  end

  def parse_output
    stage(nil)
    {stages: @stages, hidden: @hidden}
  end

  def concepts(*items)
    @concepts = items
  end

  def skin(name)
    @skin = name
  end

  def video_key_for_next_level(key)
    @video_key_for_next_level = key
  end

  def assessment(name)
    level(name, {assessment: true})
  end

  def level(name, properties = {})
    @levels << {
      :name => name,
      :stage => @stage,
      :skin => @skin,
      :concepts => @concepts.join(','),
      :video_key => @video_key_for_next_level
    }.merge(properties).select{|_, v| v.present? }
    @video_key_for_next_level = nil
  end

  def i18n_strings
    @i18n_strings['title'] = @title if @title
    @i18n_strings['description_short'] = @description_short if @description_short
    @i18n_strings['description'] = @description if @description
    @stages.each do |stage|
      @i18n_strings[stage[:stage]] = stage[:stage]
    end

    {'name'=> {@name => @i18n_strings}}
  end

  def self.parse_file(filename)
    super(filename, File.basename(filename, '.script'))
  end
end

class LevelGroupDSL < BaseDSL
  def initialize
    super
    @id = nil
    @title = nil
    @description_short = nil
    @description = nil
    @hash[:pages] = []
    @levels = []
  end

  integer :id
  string :title
  string :description_short
  string :description

  def parse_output
    {name: @name, properties: @hash}
  end

  def page
    @levels = []
    @hash[:pages] << {levels: @levels}
  end

  def level(name)
    @levels << name
  end

  def submittable(text)
    @hash[:submittable] = text
  end

  def i18n_strings
    @i18n_strings['title'] = @title if @title
    @i18n_strings['description_short'] = @description_short if @description_short
    @i18n_strings['description'] = @description if @description
    {'name'=> {@name => @i18n_strings}}
  end

  def self.parse_file(filename)
    super(filename, File.basename(filename, '.level_group'))
  end
end

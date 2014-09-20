require "csv"

class Match < Level
  include Seeded
  after_destroy :delete_match_file

  def self.setup(data)
    match = find_or_create_by({ name: data[:name] })
    match.update!(name: data[:name], game_id: Game.find_by(name: self.to_s).id, properties: data[:properties])
    match
  end

  def self.create_from_level_builder(params, level_params)
    text = level_params[:match_text] || params[:match_text]
    transaction do
      yml_file = Rails.root.join("config/locales/#{self.to_s.downcase}.en.yml")
      i18n_strings = YAML.load_file(yml_file)
      data, i18n = "#{self}DSL".constantize.parse(text, '')
      match = setup data
      i18n_strings.deep_merge! i18n
      File.write(yml_file, i18n_strings.to_yaml(:line_width => -1))
      File.write(Rails.root.join(match.filename), text)
      match
    end
  end

  def filename
    # Find a file in config/scripts/**/*.[match/multi] containing the string "name '[name]'"
    grep_string = "grep -lir \"name '#{name}'\" --include=*.#{self.class.to_s.downcase} config/scripts"
    `#{grep_string}`.chomp.presence || "config/scripts/#{name.parameterize.underscore}.#{self.class.to_s.downcase}"
  end

  def update(params)
    if params[:match_text].present?
      self.class.create_from_level_builder({match_text: params[:match_text]}, {name: name})
    else
      super(params)
    end
  end

  private
  def delete_match_file
    match_file = Rails.root.join(filename)
    File.delete(match_file) if File.exists?(match_file)
  end

end

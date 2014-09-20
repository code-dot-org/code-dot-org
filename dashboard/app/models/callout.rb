class Callout < ActiveRecord::Base
  include Seeded
  belongs_to :script_level
  
  CSV_HEADERS = 
  {
      :element_id => 'element_id',
      :localization_key => 'localization_key',
      :script_id => 'script_id',
      :level_num => 'level_num',
      :game_name => 'game_name',
      :qtip_config => 'qtip_config'
  }

  # Use the zero byte as the quote character to allow importing double quotes
  #   via http://stackoverflow.com/questions/8073920/importing-csv-quoting-error-is-driving-me-nuts
  CSV_IMPORT_OPTIONS = { col_sep: "\t", headers: true, :quote_char => "\x00" }
  
  def self.find_or_create_all_from_tsv!(filename)
    created = []
    CSV.read(filename, CSV_IMPORT_OPTIONS).each do |row|
      created << self.first_or_create_from_tsv_row!(row)
    end
    created
  end

  def self.first_or_create_from_tsv_row!(row_data)
    script_level_search_conditions = {
      'scripts.id' => row_data[CSV_HEADERS[:script_id]],
      'levels.level_num' => row_data[CSV_HEADERS[:level_num]],
      'games.name' => row_data[CSV_HEADERS[:game_name]]
    }
    script_level = ScriptLevel.joins(level: :game).joins(:script).where(script_level_search_conditions)
    
    unless script_level && script_level.count > 0
      puts "Error finding script level with search conditions: #{script_level_search_conditions}"
      return nil
    end
    
    params = {element_id: row_data[CSV_HEADERS[:element_id]],
            localization_key: row_data[CSV_HEADERS[:localization_key]],
            qtip_config: row_data[CSV_HEADERS[:qtip_config]],
            script_level: script_level.first}
    Callout.where(params).first_or_create!
  end
end

# == Schema Information
#
# Table name: levels
#
#  id                    :integer          not null, primary key
#  game_id               :integer
#  name                  :string(255)      not null
#  created_at            :datetime
#  updated_at            :datetime
#  level_num             :string(255)
#  ideal_level_source_id :integer          unsigned
#  user_id               :integer
#  properties            :text(16777215)
#  type                  :string(255)
#  md5                   :string(255)
#  published             :boolean          default(FALSE), not null
#  notes                 :text(65535)
#  audit_log             :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#  index_levels_on_name     (name)
#

require 'cdo/shared_constants'

class Applab < Blockly
  before_save :update_json_fields, :validate_maker_if_needed

  serialized_attrs %w(
    free_play
    show_turtle_before_run
    autocomplete_palette_apis_only
    execute_palette_apis_only
    text_mode_at_start
    design_mode_at_start
    hide_design_mode
    beginner_mode
    start_html
    submittable
    log_conditions
    data_tables
    data_properties
    data_library_tables
    hide_view_data_button
    show_debug_watch
    expand_debugger
    watchers_prepopulated
    fail_on_lint_errors
    debugger_disabled
    makerlab_enabled
    helper_libraries
    widget_mode
    starter_assets
    start_libraries
    libraries_enabled
  )

  # List of possible skins, the first is used as a default.
  def self.skins
    ['applab']
  end

  # List of possible palette categories
  def self.palette_categories
    %w(uicontrols canvas data turtle control math variables functions goals) +
        maker_palette_categories
  end

  def self.maker_palette_categories
    %w(Maker Circuit)
  end

  def self.create_from_level_builder(params, level_params)
    create!(
      level_params.merge(
        user: params[:user],
        game: Game.applab,
        level_num: 'custom',
        properties: {
          code_functions: JSON.parse(palette),
        }
      )
    )
  end

  def xml_blocks
    %w()
  end

  def update_palette
    if code_functions.present? && code_functions.is_a?(String)
      self.code_functions = JSON.parse(code_functions)
    end
    true
  rescue JSON::ParserError => e
    errors.add(:code_functions, "#{e.class.name}: #{e.message}")
    return false
  end

  def parse_json_property_field(property_field)
    value = properties[property_field]
    if value.present? && value.is_a?(String)
      properties[property_field] = JSON.parse value
    end
    true
  rescue JSON::ParserError => e
    errors.add(property_field, "#{e.class.name}: #{e.message}")
    return false
  end

  def update_json_fields
    palette_result = update_palette
    log_conditions_result = parse_json_property_field('log_conditions')

    success = palette_result && log_conditions_result
    throw :abort unless success
  end

  def validate_maker_if_needed
    maker_enabled = properties['makerlab_enabled'] == 'true'
    starting_category = properties['palette_category_at_start']
    if Applab.maker_palette_categories.include?(starting_category) && !maker_enabled
      raise ArgumentError.new(
        "Selected '#{starting_category}' as the palette category at start, " \
            "but 'Enable Maker APIs' is not checked."
      )
    end
  end

  def uses_droplet?
    true
  end

  def age_13_required?
    true
  end

  def self.palette
    SharedConstants::APPLAB_BLOCKS
  end

  # Add a starter asset to the level and save it in properties.
  # Starter assets are stored as an object, where the key is the
  # friendly filename and the value is the UUID filename stored in S3:
  # {
  #   # friendly_name => uuid_name
  #   "welcome.png" => "123-abc-456.png"
  # }
  def add_starter_asset!(friendly_name, uuid_name)
    self.starter_assets ||= {}
    self.starter_assets[friendly_name] = uuid_name
    save!
  end

  # Remove a starter asset by its key (friendly_name) from the level's properties.
  def remove_starter_asset!(friendly_name)
    return true unless starter_assets
    starter_assets.delete(friendly_name)
    save!
  end
end

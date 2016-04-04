# == Schema Information
#
# Table name: levels
#
#  id                       :integer          not null, primary key
#  game_id                  :integer
#  name                     :string(255)      not null
#  created_at               :datetime
#  updated_at               :datetime
#  level_num                :string(255)
#  ideal_level_source_id    :integer
#  solution_level_source_id :integer
#  user_id                  :integer
#  properties               :text(65535)
#  type                     :string(255)
#  md5                      :string(255)
#  published                :boolean          default(FALSE), not null
#  notes                    :text(65535)
#
# Indexes
#
#  index_levels_on_game_id  (game_id)
#

class Applab < Blockly
  before_save :update_json_fields
  before_save :fix_examples

  serialized_attrs %w(
    app_width
    app_height
    free_play
    show_turtle_before_run
    autocomplete_palette_apis_only
    execute_palette_apis_only
    text_mode_at_start
    design_mode_at_start
    hide_design_mode
    beginner_mode
    start_html
    encrypted_examples
    submittable
    log_conditions
    data_tables
    data_properties
    hide_view_data_button
    debugger_disabled
    makerlab_enabled
  )

  # List of possible skins, the first is used as a default.
  def self.skins
    ['applab']
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(
        user: params[:user],
        game: Game.applab,
        level_num: 'custom',
        properties: {
          code_functions: JSON.parse(palette),
          edit_code: true
        }
    ))
  end

  def xml_blocks
    %w()
  end

  def update_palette
    if self.code_functions.present? && self.code_functions.is_a?(String)
      self.code_functions = JSON.parse(self.code_functions)
    end
  rescue JSON::ParserError => e
    errors.add(:code_functions, "#{e.class.name}: #{e.message}")
    return false
  end

  def parse_json_property_field(property_field)
    value = self.properties[property_field]
    if value.present? && value.is_a?(String)
      self.properties[property_field] = JSON.parse value
    end
  rescue JSON::ParserError => e
    errors.add(property_field, "#{e.class.name}: #{e.message}")
    return false
  end

  def update_json_fields
    palette_result = update_palette
    log_conditions_result = parse_json_property_field('log_conditions')

    return palette_result && log_conditions_result
  end

  def self.palette
    <<-JSON.strip_heredoc.chomp
      {
        // UI Controls
        "onEvent": null,
        "button": null,
        "textInput": null,
        "textLabel": null,
        "dropdown": null,
        "getText": null,
        "setText": null,
        "getNumber": null,
        "setNumber": null,
        "checkbox": null,
        "radioButton": null,
        "getChecked": null,
        "setChecked": null,
        "image": null,
        "getImageURL": null,
        "setImageURL": null,
        "playSound": null,
        "showElement": null,
        "hideElement": null,
        "deleteElement": null,
        "setPosition": null,
        "setSize": null,
        "setProperty": null,
        "write": null,
        "getXPosition": null,
        "getYPosition": null,
        "setScreen": null,

        // Canvas
        "createCanvas": null,
        "setActiveCanvas": null,
        "line": null,
        "circle": null,
        "rect": null,
        "setStrokeWidth": null,
        "setStrokeColor": null,
        "setFillColor": null,
        "drawImageURL": null,
        "getImageData": null,
        "putImageData": null,
        "clearCanvas": null,
        "getRed": null,
        "getGreen": null,
        "getBlue": null,
        "getAlpha": null,
        "setRed": null,
        "setGreen": null,
        "setBlue": null,
        "setAlpha": null,
        "setRGB": null,

        // Data
        "startWebRequest": null,
        "setKeyValue": null,
        "getKeyValue": null,
        "createRecord": null,
        "readRecords": null,
        "updateRecord": null,
        "deleteRecord": null,
        "getUserId": null,
        "drawChart": null,
        "drawChartFromRecords": null,

        // Turtle
        "moveForward": null,
        "moveBackward": null,
        "move": null,
        "moveTo": null,
        "dot": null,
        "turnRight": null,
        "turnLeft": null,
        "turnTo": null,
        "arcRight": null,
        "arcLeft": null,
        "getX": null,
        "getY": null,
        "getDirection": null,
        "penUp": null,
        "penDown": null,
        "penWidth": null,
        "penColor": null,
        "penRGB": null,
        "show": null,
        "hide": null,
        "speed": null,

        // Control
        "forLoop_i_0_4": null,
        "ifBlock": null,
        "ifElseBlock": null,
        "whileBlock": null,
        "setTimeout": null,
        "clearTimeout": null,
        "setInterval": null,
        "clearInterval": null,
        "getTime": null,

        // Math
        "addOperator": null,
        "subtractOperator": null,
        "multiplyOperator": null,
        "divideOperator": null,
        "equalityOperator": null,
        "inequalityOperator": null,
        "greaterThanOperator": null,
        "greaterThanOrEqualOperator": null,
        "lessThanOperator": null,
        "lessThanOrEqualOperator": null,
        "andOperator": null,
        "orOperator": null,
        "notOperator": null,
        "randomNumber_min_max": null,
        "mathRound": null,
        "mathAbs": null,
        "mathMax": null,
        "mathMin": null,
        "mathRandom": null,

        // Variables
        "declareAssign_x": null,
        "declareNoAssign_x": null,
        "assign_x": null,
        "declareAssign_x_prompt": null,
        "declareAssign_x_promptNum": null,
        "console.log": null,
        "declareAssign_str_hello_world": null,
        "substring": null,
        "indexOf": null,
        "includes": null,
        "length": null,
        "toUpperCase": null,
        "toLowerCase": null,
        "declareAssign_list_abd": null,
        "listLength": null,
        "insertItem": null,
        "appendItem": null,
        "removeItem": null,

        // Functions
        "functionParams_none": null,
        "functionParams_n": null,
        "callMyFunction": null,
        "callMyFunction_n": null,
        "return": null,
        "comment": null
      }
    JSON
  end

  def fix_examples
    # remove nil and empty strings from examples
    return if examples.nil?
    self.examples = examples.select(&:present?)
  end
end

class Applab < Blockly
  before_save :update_palette

  serialized_attrs %w(
    app_width
    app_height
    free_play
    show_turtle_before_run
    autocomplete_palette_apis_only
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
        "write": null,
        "getXPosition": null,
        "getYPosition": null,

        // Canvas
        "createCanvas": null,
        "setActiveCanvas": null,
        "line": null,
        "circle": null,
        "rect": null,
        "setStrokeWidth": null,
        "setStrokeColor": null,
        "setFillColor": null,
        "drawImage": null,
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
        "lessThanOperator": null,
        "andOperator": null,
        "orOperator": null,
        "notOperator": null,
        "randomNumber_max": null,
        "randomNumber_min_max": null,
        "mathRound": null,
        "mathAbs": null,
        "mathMax": null,
        "mathMin": null,

        // Variables
        "declareAssign_x": null,
        "assign_x": null,
        "declareAssign_x_array_1_4": null,
        "declareAssign_x_prompt": null,
        "console.log": null,

        // Functions
        "functionParams_none": null,
        "functionParams_n": null,
        "callMyFunction": null,
        "callMyFunction_n": null,
        "return": null
      }
    JSON
  end

end

class Applab < Blockly
  before_save :update_palette

  serialized_attrs %w(
    app_width
    app_height
    free_play
  )

  def self.builder
    @@applab_builder ||= Level.find_by(name: 'builder')
  end

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

  def update_palette
    if self.code_functions.present? && self.code_functions.is_a?(String)
      self.code_functions = JSON.parse(self.code_functions)
    end
  end

  def self.palette
    <<-JSON.strip_heredoc.chomp
      {
        "onEvent": null,
        "startWebRequest": null,
        "setTimeout": null,
        "clearTimeout": null,
        "playSound": null,
        "deleteElement": null,
        "showElement": null,
        "hideElement": null,
        "setPosition": null,
        "getXPosition": null,
        "getYPosition": null,
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
        "getKeyValue": null,
        "setKeyValue": null,
        "createRecord": null,
        "readRecords": null,
        "updateRecord": null,
        "deleteRecord": null,
        "moveForward": null,
        "moveBackward": null,
        "move": null,
        "moveTo": null,
        "turnRight": null,
        "turnLeft": null,
        "turnTo": null,
        "arcRight": null,
        "arcLeft": null,
        "dot": null,
        "getX": null,
        "getY": null,
        "getDirection": null,
        "penUp": null,
        "penDown": null,
        "penWidth": null,
        "penColor": null,
        "show": null,
        "hide": null
      }
    JSON
  end

end

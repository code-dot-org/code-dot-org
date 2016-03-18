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

class Gamelab < Blockly
  before_save :update_palette

  serialized_attrs %w(
    free_play
    text_mode_at_start
    submittable
    data_properties
    hide_view_data_button
    debugger_disabled
  )

  # List of possible skins, the first is used as a default.
  def self.skins
    ['gamelab']
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(
        user: params[:user],
        game: Game.gamelab,
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

  def self.palette
    <<-JSON.strip_heredoc.chomp
      {
        // Game Lab
        "var img = loadImage": null,
        "image": null,
        "fill": null,
        "noFill": null,
        "stroke": null,
        "noStroke": null,
        "arc": null,
        "ellipse": null,
        "line": null,
        "point": null,
        "rect": null,
        "triangle": null,
        "text": null,
        "textAlign": null,
        "textSize": null,
        "drawSprites": null,
        "allSprites": null,
        "background": null,
        "width": null,
        "height": null,
        "camera": null,
        "camera.on": null,
        "camera.off": null,
        "camera.active": null,
        "camera.mouseX": null,
        "camera.mouseY": null,
        "camera.position.x": null,
        "camera.position.y": null,
        "camera.zoom": null,
        "playSound": null,

        // Sprites
        "var sprite = createSprite": null,
        "setSpeed": null,
        "getAnimationLabel": null,
        "getDirection": null,
        "getSpeed": null,
        "remove": null,
        "addAnimation": null,
        "addImage": null,
        "addSpeed": null,
        "addToGroup": null,
        "bounce": null,
        "collide": null,
        "displace": null,
        "overlap": null,
        "changeAnimation": null,
        "changeImage": null,
        "attractionPoint": null,
        "limitSpeed": null,
        "setCollider": null,
        "setVelocity": null,
        "sprite.height": null,
        "sprite.width": null,
        "sprite.animation": null,
        "depth": null,
        "friction": null,
        "immovable": null,
        "life": null,
        "mass": null,
        "maxSpeed": null,
        "sprite.position.x": null,
        "sprite.position.y": null,
        "sprite.previousPosition.x": null,
        "sprite.previousPosition.y": null,
        "removed": null,
        "restitution": null,
        "rotateToDirection": null,
        "rotation": null,
        "rotationSpeed": null,
        "scale": null,
        "shapeColor": null,
        "touching": null,
        "sprite.velocity.x": null,
        "sprite.velocity.y": null,
        "visible": null,

        // Animations
        "var anim = loadAnimation": null,
        "animation": null,
        "changeFrame": null,
        "nextFrame": null,
        "previousFrame": null,
        "clone": null,
        "getFrame": null,
        "getLastFrame": null,
        "goToFrame": null,
        "play": null,
        "rewind": null,
        "stop": null,
        "frameChanged": null,
        "frameDelay": null,
        "images": null,
        "looping": null,
        "playing": null,
        "anim.visible": null,

        // Groups
        "var group = new Group": null,
        "add": null,
        "group.remove": null,
        "clear": null,
        "contains": null,
        "get": null,
        "group.bounce": null,
        "group.collide": null,
        "group.displace": null,
        "group.overlap": null,
        "maxDepth": null,
        "minDepth": null,

        // Events
        "keyIsPressed": null,
        "key": null,
        "keyCode": null,
        "keyPressed": null,
        "keyReleased": null,
        "keyTyped": null,
        "keyDown": null,
        "keyWentDown": null,
        "keyWentUp": null,
        "mouseX": null,
        "mouseY": null,
        "pmouseX": null,
        "pmouseY": null,
        "mouseButton": null,
        "mouseIsPressed": null,
        "mouseMoved": null,
        "mouseDragged": null,
        "mousePressed": null,
        "mouseReleased": null,
        "mouseClicked": null,
        "mouseWheel": null,

        // Control
        "forLoop_i_0_4": null,
        "ifBlock": null,
        "ifElseBlock": null,
        "whileBlock": null,

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
        "declareAssign_str_hello_world": null,
        "substring": null,
        "indexOf": null,
        "includes": null,
        "length": null,
        "toUpperCase": null,
        "toLowerCase": null,
        "declareAssign_list_abd": null,
        "listLength": null,

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

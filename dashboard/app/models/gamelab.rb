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
#  index_levels_on_name     (name)
#

class Gamelab < Blockly
  before_save :update_palette

  serialized_attrs %w(
    free_play
    text_mode_at_start
    hide_animation_mode
    start_in_animation_tab
    all_animations_single_frame
    show_d_pad
    soft_buttons
    submittable
    data_properties
    hide_view_data_button
    debugger_disabled
    pause_animations_by_default
    start_animations
    teacher_markdown
  )

  # List of possible skins, the first is used as a default.
  def self.skins
    ['gamelab']
  end

  # List of possible palette categories
  def self.palette_categories
    %w(gamelab sprites groups input control math variables functions)
  end

  def self.create_from_level_builder(params, level_params)
    create!(level_params.merge(
      user: params[:user],
      game: Game.gamelab,
      level_num: 'custom',
      properties: {
        code_functions: JSON.parse(palette),
        show_d_pad: true,
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
        "draw": null,
        "drawSprites": null,
        "Game.allSprites": null,
        "Game.width": null,
        "Game.height": null,
        "Game.mouseX": null,
        "Game.mouseY": null,
        "Game.frameRate": null,
        "Game.frameCount": null,
        "playSound": null,
        "keyDown": null,
        "keyWentDown": null,
        "keyWentUp": null,
        "mouseDidMove": null,
        "mouseDown": null,
        "mouseIsOver": null,
        "mouseWentDown": null,
        "mouseWentUp": null,
        "mousePressedOver": null,
        "camera.on": null,
        "camera.off": null,
        "camera.isActive": null,
        "camera.mouseX": null,
        "camera.mouseY": null,
        "camera.x": null,
        "camera.y": null,
        "camera.zoom": null,
        "comment_GameLab": null,

        // Sprites
        "var sprite = createSprite": null,
        "createEdgeSprites": null,
        "setSpeedAndDirection": null,
        "getDirection": null,
        "getSpeed": null,
        "isTouching": null,
        "destroy": null,
        "pointTo": null,
        "bounce": null,
        "bounceOff": null,
        "collide": null,
        "displace": null,
        "overlap": null,
        "setAnimation": null,
        "setCollider": null,
        "setVelocity": null,
        "sprite.height": null,
        "sprite.width": null,
        "getScaledWidth": null,
        "getScaledHeight": null,
        "debug": null,
        "depth": null,
        "lifetime": null,
        "mirrorX": null,
        "mirrorY": null,
        "nextFrame": null,
        "pause": null,
        "play": null,
        "setFrame": null,
        "x": null,
        "y": null,
        "bounciness": null,
        "rotateToDirection": null,
        "rotation": null,
        "rotationSpeed": null,
        "scale": null,
        "shapeColor": null,
        "velocityX": null,
        "velocityY": null,
        "visible": null,
        "comment_Sprites": null,

        // Groups
        "var group = createGroup": null,
        "add": null,
        "remove": null,
        "clear": null,
        "contains": null,
        "get": null,
        "group.isTouching": null,
        "group.bounce": null,
        "group.bounceOff": null,
        "group.collide": null,
        "group.displace": null,
        "group.overlap": null,
        "maxDepth": null,
        "minDepth": null,
        "destroyEach": null,
        "pointToEach": null,
        "setAnimationEach": null,
        "setColorEach": null,
        "setColliderEach": null,
        "setDepthEach": null,
        "setHeightEach": null,
        "setLifetimeEach": null,
        "setMirrorXEach": null,
        "setMirrorYEach": null,
        "setRotateToDirectionEach": null,
        "setRotationEach": null,
        "setRotationSpeedEach": null,
        "setScaleEach": null,
        "setSpeedAndDirectionEach": null,
        "setVelocityEach": null,
        "setVelocityXEach": null,
        "setVelocityYEach": null,
        "setVisibleEach": null,
        "setWidthEach": null,
        "comment_Groups": null,

        // Drawing
        "background": null,
        "fill": null,
        "noFill": null,
        "stroke": null,
        "strokeWeight": null,
        "noStroke": null,
        "color": null,
        "arc": null,
        "ellipse": null,
        "line": null,
        "point": null,
        "rect": null,
        "regularPolygon": null,
        "shape": null,
        "text": null,
        "textAlign": null,
        "textFont": null,
        "textSize": null,
        "comment_Drawing": null,

        // Control
        "forLoop_i_0_4": null,
        "ifBlock": null,
        "ifElseBlock": null,
        "whileBlock": null,
        "comment_Control": null,

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
        "comment_Math": null,

        // Variables
        "declareAssign_x": null,
        "declareNoAssign_x": null,
        "assign_x": null,
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
        "comment_Variables": null,

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
end

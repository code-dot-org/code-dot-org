class Studio < Grid
  serialized_attrs %w(
    first_sprite_index
    protaganist_sprite_index
    success_condition
    failure_condition
    timeout_failure_tick
    soft_buttons
    edge_collisions
    projectile_collisions
    allow_sprites_outside_playspace
    sprites_hidden_to_start
    free_play
  )

  def self.create_from_level_builder(params, level_params)
    level = new(level_params.merge(user: params[:user], game: Game.custom_studio, level_num: 'custom'))
    level.create_maze(level_params, params)
    level
  end

  # List of possible skins, the first is used as a default.
  def self.skins
    ['studio']
  end

  def self.default_success_condition
    <<-JS.strip_heredoc.chomp
        function () {
          // Sample conditions:
          // return Studio.sprite[0].isCollidingWith(1);
          // return Studio.sayComplete > 0;
          // return Studio.sprite[0].emotion === Emotions.HAPPY;
          // return Studio.tickCount > 50;
        }
    JS
  end

  def self.default_failure_condition
    <<-JS.strip_heredoc.chomp
        function () {
        }
    JS
  end

  def common_blocks(type)
    <<-XML.chomp
<block type="when_run"></block>
<block type="studio_setSprite"><title name="VALUE">"witch"</title></block>
<block type="studio_setBackground">
  <title name="VALUE">"cave"</title>
</block>
<block type="studio_whenArrow">
  <title name="VALUE">up</title>
</block>
<block type="studio_whenSpriteClicked"></block>
<block type="studio_whenSpriteCollided"></block>
<block type="studio_repeatForever"></block>
<block type="studio_showTitleScreen">
  <title name="TITLE">type title here</title>
  <title name="TEXT">type text here</title>
</block>
<block type="studio_move">
  <title name="DIR">1</title>
</block>
<block type="studio_moveDistance">
  <title name="DIR">1</title>
  #{'<title name="DISTANCE">???</title>' if type == 'required_blocks'}
</block>
<block type="studio_stop"></block>
<block type="studio_wait">
  <title name="VALUE">500</title>
</block>
<block type="studio_playSound">
  <title name="SOUND">hit</title>
</block>
<block type="studio_changeScore"></block>
<block type="studio_saySprite">
  <title name="TEXT">type here</title>
</block>
<block type="studio_saySpriteParams"></block>
<block type="studio_setSpritePosition">
  <title name="VALUE">7</title>
</block>
<block type="studio_throw">
  <title name="VALUE">"blue_fireball"</title>
  <title name="DIR">1</title>
</block>
<block type="studio_makeProjectile">
  <title name="VALUE">"blue_fireball"</title>
  <title name="ACTION">"bounce"</title>
</block>
<block type="studio_setSpriteSpeed">
  <title name="VALUE">Studio.SpriteSpeed.NORMAL</title>
</block>
<block type="studio_setSpriteEmotion">
  <title name="VALUE">0</title>
</block>
<block type="studio_vanish"></block>
<block type="math_number"></block>
<block type="math_arithmetic" inline="true"></block>
#{k1_blocks(type) if is_k1 == 'true'}
    XML
  end

  # Other K1 blocks are just variants of common_blocks, but display differently when is_k1 is set
  def k1_blocks(type)
    <<-XML.chomp
<block type="studio_moveNorthDistance"></block>
<block type="studio_moveEastDistance"></block>
<block type="studio_moveSouthDistance"></block>
<block type="studio_moveWestDistance"></block>
    XML
  end

  def toolbox(type)
    <<-XML.chomp
<block type="procedures_defnoreturn"><title name="NAME">CATEGORY=Category</title></block>
#{common_blocks(type)}
    XML
  end
end

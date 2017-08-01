#!/usr/bin/env ruby
#
require_relative('../../dashboard/config/environment')
require 'cdo/properties'
require 'json'

file = File.read('./iceage_levels.json')
data_hash = JSON.parse(file)

me = User.find_by(email: "elijah@code.org")

def block_test_to_xml(test)
  titles = []
  if test.key? 'titles'
    titles = test['titles'].map do |name, val|
      val = "???" if test['type'] == "studio_saySprite" && val == "hello"
      "<title name=\"#{name}\">#{val}</title>"
    end
  end

  "<block type=\"#{test['type']}\">#{titles.join('')}</block>"
end

# Some of the levels.js required block definitions don't translate well to
# blockly xml-style definitions (usually when we want an optional title in
# blockly). Rather than try and determine dynamically when we want to expand
# on the block definition, simply manually override levels we have detected to
# need more.

REQUIRED_XML_OVERRIDES = {
  iceage_move_to_actor: <<-XML.chomp,
    <xml>
      <block type="studio_moveDistance">
        <title name="SPRITE">0</title>
        <title name="DIR">4</title>
        <title name="DISTANCE">200</title>
      </block>
      <block type="studio_playSound">
        <title name="SOUND">???</title>
      </block>
    </xml>
  XML

  iceage_move_events: <<-XML.chomp,
    <xml>
      <block type="studio_move">
        <title name="DIR">???</title>
      </block>
    </xml>
  XML

  iceage_sound_and_points: <<-XML.chomp,
    <xml>
      <block type="studio_changeScore">
        <title name="VALUE">1</title>
      </block>
      <block type="studio_playSound">
        <title name="SOUND">winpoint</title>
      </block>
    </xml>
  XML

  iceage_warn_ice_age: <<-XML.chomp,
    <xml>
      <block type="studio_setBackground">
        <title name="VALUE">???</title>
      </block>
      <block type="studio_setSpriteSpeed">
        <title name="SPRITE">0</title>
        <title name="VALUE">Studio.SpriteSpeed.FAST</title>
      </block>
    </xml>
  XML

  iceage_throw_hearts: <<-XML.chomp,
    <xml>
      <block type="studio_setSpriteEmotion">
        <title name="SPRITE">1</title>
        <title name="VALUE">1</title>
      </block>
      <block type="studio_throw">
        <title name="SPRITE">0</title>
        <title name="VALUE">"ia_projectile_1"</title>
        <title name="DIR">2</title>
      </block>
    </xml>
  XML
}.stringify_keys

def callout_to_json(old_level)
  callouts = []

  # Grab all tsv-style callouts
  old_level.script_levels.each do |sl|
    callouts += old_level.available_callouts(sl)
  end

  # convert to hashes
  callouts.map! do |callout|
    {
      "localization_key": callout.localization_key,
      "callout_text": callout.callout_text,
      "element_id": callout.element_id,
      "qtip_config": JSON.parse(callout.qtip_config),
      "on": callout.on,
    }.stringify_keys
  end

  callouts.to_json
end

def sanitize_props(props, name, old_level)
  props["skin"] = 'iceage'

  if REQUIRED_XML_OVERRIDES.key? name
    props["requiredBlocks"] = REQUIRED_XML_OVERRIDES[name]
  else
    required_blocks = props["requiredBlocks"].flatten.map(&method(:block_test_to_xml))
    props["requiredBlocks"] = "<xml>#{required_blocks.join('')}</xml>"
  end

  props["startBlocks"] = "<xml>#{props['startBlocks']}</xml>"

  props["toolboxBlocks"] = props.delete("toolbox")

  props["instructions"] = I18n.t("data.level.instructions").try(:[], "studio_#{name}".to_sym)

  props["callout_json"] = callout_to_json(old_level)

  props["scale"] = props["scale"] && props["scale"].to_json
  props["goal"] = props["goal"] && props["goal"].to_json
  props["maze"] = props.delete("map").to_json

  props.transform_keys {|k| k.to_s.underscore}
end

data_hash.each do |name, props|
  puts "Updating #{name}"
  old_level = Level.find_by_key("blockly:Studio:#{name}")

  next unless old_level

  old_level.update!(
    type: "Studio",
    level_num: 'custom',
    user: me,
    game: Game.custom_studio,
    name: name,
    properties: sanitize_props(props, name, old_level),
    published: true
  )
end

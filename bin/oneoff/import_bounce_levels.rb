#!/usr/bin/env ruby
#
require_relative('../../dashboard/config/environment')
require 'cdo/properties'
require 'json'

file = File.read('./bounce_levels.json')
data_hash = JSON.parse(file)

me = User.find_by(email: "elijah@code.org")

def block_test_to_xml(test)
  titles = []
  if test.key? 'titles'
    titles = test['titles'].map do |name, val|
      "<title name=\"#{name}\">#{val}</title>"
    end
  end

  "<block type=\"#{test['type']}\">#{titles.join('')}</block>"
end

def sanitize_props(props, name)
  # levels like 1_basketball should have the basketball skin
  skin = /^\d*_(\w*)$/.match(name)
  props["skin"] = skin ? skin[1] : "bounce"

  required_blocks = props["requiredBlocks"].flatten.map(&method(:block_test_to_xml))
  props["requiredBlocks"] = "<xml>#{required_blocks.join('')}</xml>"

  props["startBlocks"] = "<xml>#{props['startBlocks']}</xml>"

  props["toolboxBlocks"] = props.delete("toolbox")

  props["instructions"] = I18n.t("data.level.instructions").try(:[], "bounce_#{name}".to_sym)

  props["goal"] = props["goal"] && props["goal"].to_json
  props["maze"] = props.delete("map").to_json

  props["ballDirection"] = props["ballDirection"] && props["ballDirection"].to_json
  props["timeoutFailureTick"] = props["timeoutFailureTick"] && props["timeoutFailureTick"].to_json
  props["useFlagGoal"] = props["useFlagGoal"] && props["useFlagGoal"].to_json

  props.transform_keys {|k| k.to_s.underscore}
end

data_hash.each do |name, props|
  puts "Updating #{name}"
  old_level = Level.find_by_key("blockly:Bounce:#{name}")

  next unless old_level

  old_level.update!(
    type: "Bounce",
    level_num: 'custom',
    user: me,
    game: Game.bounce,
    name: "bounce_#{name}",
    properties: sanitize_props(props, name),
    published: true
  )
end

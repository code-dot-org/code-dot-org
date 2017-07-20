#!/usr/bin/env ruby
#
require_relative('../../dashboard/config/environment')
require 'cdo/properties'
require 'json'

file = File.read('./flappy_levels.json')
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
  props["skin"] = "flappy"

  required_blocks = props["requiredBlocks"].flatten.map(&method(:block_test_to_xml))
  props["requiredBlocks"] = "<xml>#{required_blocks.join('')}</xml>"

  props["startBlocks"] = "<xml>#{props['startBlocks']}</xml>"

  props["toolboxBlocks"] = props.delete("toolbox")

  props["instructions"] = I18n.t("data.level.instructions").try(:[], "flappy_#{name}".to_sym)

  props["goal"] = props["goal"].to_json
  props["scale"] = props["scale"].to_json

  props.transform_keys {|k| k.to_s.underscore}
end

data_hash.each do |name, props|
  old_level = Level.find_by_key("blockly:Flappy:#{name}")

  next unless old_level

  old_level.update!(
    type: "Flappy",
    user: me,
    game: Game.custom_flappy,
    name: "flappy_#{name}",
    properties: sanitize_props(props, name),
    published: true
  )
end

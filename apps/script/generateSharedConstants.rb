#!/usr/bin/env ruby
#
# This file is used to generate a static JS file containing some of the same
# constants that we have defined in a ruby file. This allows us to ensure that
# we're using the same set of constants in dashboard and apps.
#
require 'json'
require 'active_support/inflector'
require_relative '../../lib/cdo/shared_constants'

REPO_DIR = File.expand_path('../../../', __FILE__)

def generate_shared_js_file(content, path)
  output = <<CONTENT
// This is a generated file and SHOULD NOT BE EDITTED MANUALLY!!
// Contents are generated as part of grunt build
// Source of truth is lib/cdo/shared_constants.rb

#{content}
CONTENT

  File.open(path, 'w') {|f| f.write(output)}
end

# This generates a JS object from its ruby equivalent based on the constant
# name in shared_constants
def generate_constants(shared_const_name)
  raw = SharedConstants.const_get(shared_const_name)
  hash = raw.is_a?(OpenStruct) ? raw.marshal_dump : JSON.parse(raw)
  "export const #{shared_const_name.downcase.camelize} = #{JSON.pretty_generate(hash)};"
end

def main
  shared_content = [
    generate_constants('LEVEL_KIND'),
    generate_constants('LEVEL_STATUS'),
    generate_constants('SECTION_LOGIN_TYPE')
  ].join("\n\n")

  generate_shared_js_file(shared_content, "#{REPO_DIR}/apps/src/util/sharedConstants.js")
  generate_shared_js_file(generate_constants('APPLAB_BLOCKS'), "#{REPO_DIR}/apps/src/applab/sharedApplabBlocks.js")
  generate_shared_js_file(generate_constants('APPLAB_GOAL_BLOCKS'), "#{REPO_DIR}/apps/src/applab/sharedApplabGoalBlocks.js")
  generate_shared_js_file(generate_constants('GAMELAB_BLOCKS'), "#{REPO_DIR}/apps/src/gamelab/sharedGamelabBlocks.js")
end

main

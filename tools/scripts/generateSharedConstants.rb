#!/usr/bin/env ruby
#
# This file generates a static json file, and uses it to create enum-like objects
# that can be used in both dashboard and apps. It does this by generating two
# static files - one which is a ruby file to be used by dashboard, the other
# which is a js file to be used by apps. In both cases, the expectation is that
# the generated files get checked into the repo
#
require 'json'
require_relative '../../lib/cdo/shared_constants'

REPO_DIR = File.expand_path('../../../', __FILE__)
OUTPUT_JS = "#{REPO_DIR}/apps/src/sharedConstants.js"

def generate_js
  output = "// This is a generated file and SHOULD NOT BE EDITTED MANUALLY!!\n"\
    "// Contents are generated from lib/cdo/shared_constants.rb by running\n"\
    "// `rake build:shared_constants`\n"\
    "\n"\
    "#{generate_level_kind}\n\n"\
    "#{generate_level_status}\n\n"

  File.open(OUTPUT_JS, 'w') {|f| f.write(output)}
end

def generate_level_kind
  hash = SharedConstants::LevelKind.marshal_dump
  "export const LevelKind = #{JSON.pretty_generate(hash)};"
end

def generate_level_status
  hash = SharedConstants::LevelStatus.marshal_dump
  "export const LevelStatus = #{JSON.pretty_generate(hash)};"
end

generate_js

#!/usr/bin/env ruby
#
# This file is used to generate a static JS file containing some of the same
# constants that we have defined in a ruby file. This allows us to ensure that
# we're using the same set of constants in dashboard and apps.
#
require 'json'
require_relative '../../lib/cdo/shared_constants'

REPO_DIR = File.expand_path('../../../', __FILE__)
OUTPUT_JS = "#{REPO_DIR}/apps/src/util/sharedConstants.js"

def generate_js
  output = <<CONTENT
// This is a generated file and SHOULD NOT BE EDITTED MANUALLY!!
// Contents are generated as part of grunt build
// Source of truth is lib/cdo/shared_constants.rb

#{generate_level_kind}
#{generate_level_status}
CONTENT

  File.open(OUTPUT_JS, 'w') {|f| f.write(output)}
end

# Each of these generate a particular JS "enum" from its ruby equivalent. As we
# want to add more constants, we'll need to add more similar methods that extract
# the content we care about from the ruby object, and write it as JS.

def generate_level_kind
  hash = SharedConstants::LEVEL_KIND.marshal_dump
  "export const LevelKind = #{JSON.pretty_generate(hash)};"
end

def generate_level_status
  hash = SharedConstants::LEVEL_STATUS.marshal_dump
  "export const LevelStatus = #{JSON.pretty_generate(hash)};"
end

generate_js

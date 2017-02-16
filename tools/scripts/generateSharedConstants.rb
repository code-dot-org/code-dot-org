#!/usr/bin/env ruby
#
# This file generates a static json file, and uses it to create enum-like objects
# that can be used in both dashboard and apps. It does this by generating two
# static files - one which is a ruby file to be used by dashboard, the other
# which is a js file to be used by apps. In both cases, the expectation is that
# the generated files get checked into the repo
#
require 'json'

REPO_DIR = File.expand_path('../../../', __FILE__)
INPUT_JSON = "#{REPO_DIR}/shared/config/constants.json"
OUTPUT_RUBY = "#{REPO_DIR}/lib/cdo/shared_constants.rb"
OUTPUT_JS = "#{REPO_DIR}/apps/src/sharedConstants.js"

HEADER = "This file is generated via generateSharedConstants.rb. DO NOT CHANGE MANUALLY"

# Generates a static ruby file representing our shared constants
def generate_ruby(enums)
  constants = ''

  enums.each do |enum|
    key = enum['contents'].keys[0]
    value = JSON.pretty_generate(enum['contents'][key])
    # add indenting on lines that aren't the first
    value = value.split("\n").map{|line| '    ' + line}.join("\n")
    # value = [first, rest.map{|line| '  ' + line}].join("\n")
    if enum['comment']
      constants += "# #{enum['comment']}\n  "
    end
    constants += "#{key} = OpenStruct.new(\n#{value}\n  )\n\n  "
  end
  constants.strip!

  output = <<CONSTANTS
# #{HEADER}

module SharedConstants
  #{constants}
end
CONSTANTS

  File.open(OUTPUT_RUBY, 'w') {|f| f.write(output)}
end

# Generates a static ruby file representing our shared constants
def generate_js(enums)
  constants = ''

  enums.each do |enum|
    key = enum['contents'].keys[0]
    value = JSON.pretty_generate(enum['contents'][key])
    if enum['comment']
      constants += "// #{enum['comment']}\n"
    end
    constants += "export const #{key} = #{value};\n\n"
  end
  output = <<CONSTANTS
// #{HEADER}

#{constants}
CONSTANTS
  File.open(OUTPUT_JS, 'w') {|f| f.write(output)}
end

def main
  file = File.read(INPUT_JSON)
  obj = JSON.parse(file)

  generate_ruby(obj['enums'])
  generate_js(obj['enums'])
end

main

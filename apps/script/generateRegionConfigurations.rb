#!/usr/bin/env ruby
#
# This file is used to generate a static JS file containing some of the same
# constants that we have defined in a ruby file. This allows us to ensure that
# we're using the same set of constants in dashboard and apps.
#

require 'fileutils'
require 'json'
require 'yaml'

# For camelize, etc
require 'active_support/inflector'

# For deep_transform_keys and deep_symbolize_keys
require 'active_support/core_ext/hash'

$LOAD_PATH.unshift File.expand_path('../../../lib', __FILE__)
$LOAD_PATH.unshift File.expand_path('../../../shared/middleware', __FILE__)

# Get a reference to our Cdo::GlobalEdition class
require 'cdo/global_edition'

# Generates the actual TypeScript file.
def generate_region_ts_file(content, path)
  output = <<CONTENT
/* eslint-disable */

// This is a generated file and SHOULD NOT BE EDITED MANUALLY!!
// Contents are generated as part of grunt build
// Source of truth is lib/cdo/global.rb and files in config/global/

#{content}
CONTENT

  FileUtils.mkdir_p File.dirname(path)
  File.open(path, 'w') {|f| f.write(output)}
end

def main
  content = []
  table_content = []

  # For each region, we want to get a JSON-appropriate version of its configuration
  Cdo::GlobalEdition::REGIONS.each do |region|
    # Get the configuration for this region
    configuration = Cdo::GlobalEdition.configuration_for(region)

    # Complain if any pages keys are not URLs
    raise "'pages' must contain URLs starting with '/'" unless (configuration['pages'] || {}).keys.all? {|url| url.to_s.include?('/')}

    # Build out the region specific table. This is, effectively, a JSON copy of the
    # configuration found in config/global/*.yml
    #
    # The table itself will be named Region<Name>, so, for example, region 'fa'
    # will be: RegionFa
    content << "export const Region#{region.to_s.camelize} = #{JSON.pretty_generate(configuration)} as const;"

    # The entry into the lookup table we will write out in the end
    table_content << "\"#{region.to_s}\": Region#{region.to_s.camelize},"
  end

  # Build the lookup table keyed for each region and point that name to the data
  # we build above
  table_content = <<TABLE_CONTENT
export const Regions = {
  #{table_content.join("\n  ")}
} as const;
TABLE_CONTENT

  # Add the 'Regions' lookup table to the end
  content << table_content

  # Build out the final string
  content = content.join("\n\n")

  # Save that string to the given file
  repo_dir = File.expand_path('../../../', __FILE__)
  generate_region_ts_file(content, "#{repo_dir}/apps/generated-scripts/globalRegionConstants.ts")
end

main

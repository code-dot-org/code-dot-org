#!/usr/bin/env ruby
require 'json'
require 'yaml'
require 'fileutils'

output_directory = '/Volumes/code-dot-org/code-dot-org/dashboard/config/locales'
Dir.glob('/Volumes/code-dot-org/code-dot-org/dashboard/config/locales/*.en.yml') do |yml_file|
  output_dir_name =  File.basename(yml_file, '.en.yml')
  FileUtils.mkdir_p(File.join(output_directory, output_dir_name))
  output_json_file = File.join(output_directory, output_dir_name, 'en.json')
  yaml_data = YAML.load_file(yml_file)

  File.write(output_json_file, JSON.pretty_generate(yaml_data))
end

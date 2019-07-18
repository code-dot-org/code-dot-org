#!/usr/bin/env ruby
require File.expand_path('../../../dashboard/config/environment', __FILE__)
require 'json'

new_dir = File.expand_path("./i18n/locales/source/course_content")
old_dir = File.expand_path("/tmp/course_content")

Dir.glob(new_dir + "/**/*.json").each do |new_file|
  old_file = new_file.sub(new_dir, old_dir)
  puts new_file
  puts old_file
  new_data = JSON.parse(File.read(new_file))
  old_data = JSON.parse(File.read(old_file))

  File.open(new_file, "w") do |file|
    file.write(JSON.pretty_generate(new_data.deep_merge(old_data)))
  end
end

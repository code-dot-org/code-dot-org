#!/usr/bin/env ruby
require_relative './config'

if ARGV.empty?
  puts "Usage: ./deploy.rb <template-name>"
  exit 1
end

template_name = ARGV[0]
template_file = "#{template_name}.yml.erb"

unless File.exist?(template_file)
  puts "Error: Template file '#{template_file}' not found."
  exit 1
end

puts "\nTransforming ERB to YAML for template '#{template_name}'..."
`erb -T - -r ./config.rb #{template_file} > #{template_name}.yml`
if $?&.exitstatus == 0
  puts "Success!"
else
  puts "Error: Failed to transform ERB to YAML."
end

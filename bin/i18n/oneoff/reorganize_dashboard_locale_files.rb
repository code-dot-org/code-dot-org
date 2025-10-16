#!/usr/bin/env ruby
require 'fileutils'
require_relative '../i18n_script_utils'

dashboard_dir = './dashboard/config/locales'

# Clearing translations from dashboard directory
Dir.glob(File.join(dashboard_dir, '*.{json,yml}')) do |dashboard_file|
  file_name = File.basename(dashboard_file)
  file_parts = file_name.split('.')
  format = file_parts[-1]
  locale = file_parts[-2]
  feature = file_parts[-3].nil? ? 'base' : file_parts[-3]
  new_file_dir = File.join(dashboard_dir, feature, "#{locale}.#{format}")
  puts "Moving #{dashboard_file} to #{new_file_dir}"
  I18nScriptUtils.move_file(dashboard_file, new_file_dir)
end

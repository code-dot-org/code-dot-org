#!/usr/bin/env ruby

require 'fileutils'

# This script's function is to move translation JSON files from our
# i18n directory into a backup directory in the root of our repo.
# The files are not meant to be kept there long term. They should
# eventually be deleted.

# The reason why this was originally used is in the case that a `Script`
# no longer existed and caused the i18n sync-out step to fail with a
# `RuntimeError: Do not call Script.get_from_cache with a family_name`
# error. Just one of the reasons this could be the case is that the
# `Script` was renamed or deleted.

# Link to sync build issue Slack thread:
# https://codedotorg.slack.com/archives/C99KAHFK9/p1652484599761789?thread_ts=1652466199.476689&cid=C99KAHFK9
# Where in our sync the error occurs:
# https://github.com/code-dot-org/code-dot-org/blob/staging/bin/i18n/sync-out.rb#L319

# Run from root of code-dot-org repo on the i18n dev machine
puts 'Moving content'

file_count = 0
script = 'poem-art'

non_locale_i18n_directories = ['i18n/locales/original', 'i18n/locales/source', 'i18n/locales/en-US']
Dir.glob("i18n/locales/**").each do |directory|
  next if non_locale_i18n_directories.include? directory
  file = File.join(directory, "/course_content/other/#{script}.json")
  locale = directory.delete_prefix('i18n/locales/')

  if File.exist?(file)
    destination = "backup/#{locale}/course_content/other/#{script}.json"
    FileUtils.mkdir_p(File.dirname(destination))
    FileUtils.mv(file, destination)
    file_count += 1
  else
    puts "Not moving #{file}"
  end
end

puts "Finished moving #{file_count} files"

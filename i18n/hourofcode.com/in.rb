#! /usr/bin/env ruby
require 'fileutils'

## copy files from hourofcode to i18n/locales

loc_dir = "../locales/source/hourofcode/i18n"
orig_file = "../../pegasus/sites.v3/hourofcode.com/i18n/en.yml"
FileUtils.cp(orig_file, loc_dir)

loc_dir = "../locales/source/hourofcode/public"
orig_dir = Dir["../../pegasus/sites.v3/hourofcode.com/public/*.md"]
orig_dir.each do |file|
  FileUtils.cp(orig_dir, loc_dir)
end

loc_dir = "../locales/source/hourofcode/public/resources"
orig_dir = "../../pegasus/sites.v3/hourofcode.com/public/resources/*.md"
orig_dir.each do |file|
  FileUtils.cp(orig_dir, loc_dir)
end

loc_dir = "../locales/source/hourofcode/public/files"
orig_dir = "../../pegasus/sites.v3/hourofcode.com/public/files/*.idml"
orig_dir.each do |file|
  FileUtils.cp(orig_dir, loc_dir)
end

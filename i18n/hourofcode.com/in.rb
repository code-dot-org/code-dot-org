#! /usr/bin/env ruby
require 'fileutils'

## copy files from hourofcode to i18n/locales

loc_dir = "../locales/source/hourofcode"
orig_file = "../../pegasus/sites.v3/hourofcode.com/i18n/en.yml"
FileUtils.cp(orig_file, loc_dir)

orig_dir = Dir["../../pegasus/sites.v3/hourofcode.com/public/*.md"]
orig_dir.each do |file|
  loc_dir = "../locales/source/hourofcode"
  FileUtils.cp(file, loc_dir)
end

orig_dir = Dir["../../pegasus/sites.v3/hourofcode.com/public/how-to/*.md"]
orig_dir.each do |file|
  loc_dir = "../locales/source/hourofcode/how-to"
  FileUtils.cp(file, loc_dir)
end

orig_dir = Dir["../../pegasus/sites.v3/hourofcode.com/public/promote/*.md"]
orig_dir.each do |file|
  loc_dir = "../locales/source/hourofcode/promote"
  FileUtils.cp(file, loc_dir)
end

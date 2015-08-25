#! /usr/bin/env ruby
require 'fileutils'

## copy files from hourofcode to i18n/locales

loc_dir = "../locales/source/hourofcode/emails"
orig_file = "../../pegasus/emails/hoc_signup_2015_receipt.md"
FileUtils.cp(orig_file, loc_dir)

loc_dir = "../locales/source/hourofcode"
orig_file = "../../pegasus/sites.v3/hourofcode.com/i18n/en.yml"
FileUtils.cp(orig_file, loc_dir)

loc_dir = "../locales/source/hourofcode"
orig_file = "../../pegasus/sites.v3/code.org/public/privacy.md"
FileUtils.cp(orig_file, loc_dir)

loc_dir = "../locales/source/hourofcode"
orig_file = "../../pegasus/sites.v3/code.org/public/tos.md"
FileUtils.cp(orig_file, loc_dir)

orig_dir = Dir["../../pegasus/sites.v3/hourofcode.com/public/*.md"]
orig_dir.each do |file|
  loc_dir = "../locales/source/hourofcode"
  FileUtils.cp(file, loc_dir)
end

orig_dir = Dir["../../pegasus/sites.v3/hourofcode.com/public/files/*.idml"]
orig_dir.each do |file|
  loc_dir = "../locales/source/hourofcode/files"
  FileUtils.cp(file, loc_dir)
end

orig_dir = Dir["../../pegasus/sites.v3/hourofcode.com/public/resources/*.md"]
orig_dir.each do |file|
  loc_dir = "../locales/source/hourofcode/resources"
  FileUtils.cp(file, loc_dir)
end

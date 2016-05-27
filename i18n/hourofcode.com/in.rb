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

header = "---\ntitle: Privacy Policy\n---\n### The binding legal language is in English, and can be found <a href='https://code.org/privacy'>here</a>. Below is a translation.\n"
Dir.glob("../locales/source/hourofcode/privacy.md").each do |file|
  File.write(file, File.read(file).gsub(/---\ntitle: Privacy Policy\n---\n/m, ""))
  File.write(file, header + File.read(file))
end

loc_dir = "../locales/source/hourofcode"
orig_file = "../../pegasus/sites.v3/code.org/public/tos.md"
FileUtils.cp(orig_file, loc_dir)

header = "---\ntitle: Terms of Service\n---\n### The binding legal language is in English, and can be found <a href='https://code.org/tos'>here</a>. Below is a translation.\n"
Dir.glob("../locales/source/hourofcode/tos.md").each do |file|
  File.write(file, File.read(file).gsub(/---\ntitle: Terms of Service\n---\n/m, ""))
  File.write(file, header + File.read(file))
end

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

orig_dir = Dir["../../pegasus/sites.v3/hourofcode.com/public/prizes/*.md"]
orig_dir.each do |file|
  loc_dir = "../locales/source/hourofcode/prizes"
  FileUtils.cp(file, loc_dir)
end

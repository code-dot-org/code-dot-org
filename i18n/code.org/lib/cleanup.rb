#! /usr/bin/env ruby
require 'fileutils'

dashboard_files = [
  'data',
  'devise',
  'dsls',
  'instructions',
  'match',
  'multi',
  'scripts',
  'slides',
  'unplugged'
]

# base files
file = "../../dashboard/config/locales/pt-BR.yml"
File.write(file, File.read(file).gsub(/"pt-BR":/, '"pt":'))
file = "../../dashboard/config/locales/pt-PT.yml"
File.write(file, File.read(file).gsub(/"pt":/, '"pt-PT":'))

# all other files
dashboard_files.each do |dashboard|
  file = "../../dashboard/config/locales/#{dashboard}.pt-BR.yml"
  File.write(file, File.read(file).gsub(/"pt-BR":/, '"pt":'))

  file = "../../dashboard/config/locales/#{dashboard}.pt-PT.yml"
  File.write(file, File.read(file).gsub(/"pt":/, '"pt-PT":'))
end

# rebuild blockly js files
`./../../blockly-core/i18n/codeorg-messages.sh`
FileUtils.cp_r '../../blockly-core/msg/js/.', '../../apps/lib/blockly/'

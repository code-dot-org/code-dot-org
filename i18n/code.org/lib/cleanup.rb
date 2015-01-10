#! /usr/bin/env ruby
require 'fileutils'

dashboard_files = [
  'contract_match',
  'data',
  'devise',
  'dsls',
  'match',
  'multi',
  'scripts',
  'slides',
  'text_match',
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


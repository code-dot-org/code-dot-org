#! /usr/bin/env ruby

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

#base files
ruby file = "../Documents/workspace/code-dot-org/code-dot-org/dashboard/config/locales/pt-BR.yml"
File.write(file, File.read(file).gsub(/"pt-BR":/, '"pt":'))
file = "../Documents/workspace/code-dot-org/code-dot-org/dashboard/config/locales/pt-PT.yml"
File.write(file, File.read(file).gsub(/"pt":/, '"pt-PT":'))

#all other files
dashboard_files.each do |dashboard|
  file = "../Documents/workspace/code-dot-org/code-dot-org/dashboard/config/locales/#{dashboard}.pt-BR.yml"
  File.write(file, File.read(file).gsub(/"pt-BR":/, '"pt":'))

  file = "../Documents/workspace/code-dot-org/code-dot-org/dashboard/config/locales/#{dashboard}.pt-PT.yml"
  File.write(file, File.read(file).gsub(/"pt":/, '"pt-PT":'))
end



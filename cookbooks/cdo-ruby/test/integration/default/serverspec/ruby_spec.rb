require_relative '../../../kitchen/data/helper_spec'

file_exist '/usr/bin/ruby2.6'
cmd 'ruby -v', 'ruby 2.6'
cmd 'gem -v', '3.1.6'
cmd 'bundler -v', '2.2.33'

require_relative '../../../kitchen/data/helper_spec'

file_exist '/usr/bin/ruby2.7'
cmd 'ruby -v', 'ruby 2.7'
cmd 'gem -v', '3.1.6'
cmd 'bundler -v', '2.3.22'

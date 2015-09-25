require_relative '../../../kitchen/data/helper_spec'

file_exist '/usr/bin/ruby2.0'
cmd 'bundler -v', '1.10.4'
cmd 'ruby -v', 'ruby 2.0'
cmd 'gem -v', '2.4.8'

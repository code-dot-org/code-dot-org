require_relative '../../../kitchen/data/helper_spec'

file_exist '/usr/local/bin/ruby'
cmd 'ruby -v', 'ruby 2.7'
cmd 'gem -v', '3.3.22'
cmd 'bundler -v', '2.3.22'

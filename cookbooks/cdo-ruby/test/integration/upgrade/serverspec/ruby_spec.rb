require_relative '../../../kitchen/data/helper_spec'

file_exist '/usr/bin/ruby2.2'
file_exist '/usr/bin/gem2.2'
file_not_exist '/usr/bin/ruby2.0'
file_not_exist '/usr/bin/gem2.0'
cmd 'ruby -v', 'ruby 2.2'
cmd 'gem -v', '2.4.8'
cmd 'bundler -v', '1.10.6'

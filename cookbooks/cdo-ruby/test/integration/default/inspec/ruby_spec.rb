require_relative '../../../shared/helper_spec'

file_exist '/usr/local/bin/ruby'
cmd 'ruby -v', '3.0.5'
cmd 'gem -v', '3.3.22'
cmd 'bundler -v', '2.3.22'

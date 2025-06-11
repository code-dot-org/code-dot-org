require_relative '../../../shared/helper_spec'

file_exist '/usr/local/bin/ruby'
cmd 'ruby -v', '3.1.0'
cmd 'gem -v', '3.3.22'
cmd 'bundler -v', '2.5.17'

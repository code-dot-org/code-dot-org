require_relative '../../../shared/helper_spec'

file_exist '/usr/local/bin/ruby'
cmd 'ruby -v', '3.3.4'
cmd 'gem -v', '3.5.17'
cmd 'bundler -v', '2.5.17'

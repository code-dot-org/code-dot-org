require_relative '../../../shared/helper_spec'

file_exist '/usr/local/bin/ruby'
cmd 'ruby -v', '3.2.11'
cmd 'gem -v', '3.3.27'
cmd 'bundler -v', '2.5.17'

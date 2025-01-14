require_relative '../../../shared/helper_spec'

file_exist '/usr/local/bin/uv'
cmd 'uv -v', '0.5.8'

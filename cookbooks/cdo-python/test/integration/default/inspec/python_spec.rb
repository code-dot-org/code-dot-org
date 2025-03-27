require_relative '../../../shared/helper_spec'

file_exist '/usr/local/bin/uv'
cmd 'uv --version', '0.5.18'

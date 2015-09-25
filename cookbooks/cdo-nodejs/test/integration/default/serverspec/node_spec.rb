require_relative '../../../kitchen/data/helper_spec'

file_exist '/usr/bin/node'
cmd 'node -v', 'v4.1.1'
cmd 'npm -v', '3.3.4'

require_relative '../../../kitchen/data/helper_spec'

file_exist '/usr/bin/node'
cmd 'node -v', 'v8.'

cmd 'which yarn', '/usr/bin/yarn'
cmd 'yarn --version', '1.6.0'

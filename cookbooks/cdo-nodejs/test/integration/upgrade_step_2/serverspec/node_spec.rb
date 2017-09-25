require_relative '../../../kitchen/data/helper_spec'

file_exist '/usr/bin/node'
cmd 'node -v', 'v6.'
cmd 'npm -v', '3.'

cmd 'which yarn', '/usr/bin/yarn'
cmd 'yarn --version', '0.23.2'

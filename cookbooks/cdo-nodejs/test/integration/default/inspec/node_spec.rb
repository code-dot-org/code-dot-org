require_relative '../../../shared/helper_spec'

cmd 'node -v', 'v20.'

cmd 'which yarn', '/usr/bin/yarn'
cmd 'yarn --version', '1.22.19'

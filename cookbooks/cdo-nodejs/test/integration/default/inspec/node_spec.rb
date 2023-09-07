require_relative '../../../shared/helper_spec'

cmd 'node -v', 'v18.'

cmd 'which yarn', '/usr/bin/yarn'
cmd 'yarn --version', '3.6.3'

version = node['cdo-freegeoip']['version']
port = node['cdo-freegeoip']['port']

ark 'freegeoip' do
  version version
  url "https://github.com/fiorix/freegeoip/releases/download/v#{version}/freegeoip-#{version}-linux-amd64.tar.gz"
  checksum node['cdo-freegeoip']['checksum']
  has_binaries ['freegeoip']
  notifies :run, 'execute[bind privileges]'
end

# Allow freegeoip executable to bind to low-level ports.
execute 'bind privileges' do
  # This command breaks on Docker with the AUFS driver, unfortunately.
  # Ref: https://github.com/docker/docker/issues/1070#issuecomment-22206125
  command "setcap 'cap_net_bind_service=+ep' $(readlink -f $(which freegeoip))"
  action :nothing
end

poise_service_user 'freegeoip'

poise_service 'freegeoip' do
  command "freegeoip -http :#{port}"
  user 'freegeoip'
  directory '/usr/local/freegeoip'
end

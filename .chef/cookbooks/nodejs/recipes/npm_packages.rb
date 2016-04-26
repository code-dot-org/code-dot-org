node['nodejs']['npm_packages'].each do |pkg|
  f = nodejs_npm pkg['name'] do
    action :nothing
  end
  pkg.each do |key, value|
    f.send(key, value) unless key == 'name' || key == 'action'
  end
  action = pkg.key?('action') ? pkg['action'] : :install
  f.action(action)
end if node['nodejs'].key?('npm_packages')

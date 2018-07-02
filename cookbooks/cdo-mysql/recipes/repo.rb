apt_repository 'mysql' do
  uri 'http://repo.mysql.com/apt/ubuntu'
  distribution node['lsb']['codename']
  components ['mysql-5.7']
  key '5072E1F5'
  keyserver 'pgp.mit.edu'
  retries 3
end

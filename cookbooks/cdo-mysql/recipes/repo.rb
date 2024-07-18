apt_repository 'mysql' do
  uri 'http://repo.mysql.com/apt/ubuntu'
  distribution node['lsb']['codename']
  components ['mysql-8.0']

  # https://dev.mysql.com/doc/refman/8.0/en/checking-gpg-signature.html
  key '3A79BD29'

  keyserver 'keyserver.ubuntu.com'
  retries 3
end

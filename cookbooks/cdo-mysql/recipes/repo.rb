apt_repository 'mysql' do
  uri 'http://repo.mysql.com/apt/ubuntu'
  distribution node['lsb']['codename']
  components ['mysql-5.7']
  # https://dev.mysql.com/doc/refman/5.7/en/checking-gpg-signature.html
  key '3A79BD29'
  keyserver 'keyserver.ubuntu.com'
  retries 3
end

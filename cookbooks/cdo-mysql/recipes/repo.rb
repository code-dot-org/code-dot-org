apt_repository 'mysql' do
  uri 'http://repo.mysql.com/apt/ubuntu'

  # hardcode the distribution we target to Ubuntu 18 rather than whatever our
  # current is, since that's the last LTS for which a MySQL 5.7 package was
  # distributed. Once we update to MySQL 8+, this can be restored.
  #distribution node['lsb']['codename']
  distribution 'bionic'

  # Pin to MySQL 5.7 until we're ready to update to MySQL 8
  components ['mysql-5.7']

  # https://dev.mysql.com/doc/refman/5.7/en/checking-gpg-signature.html
  key '3A79BD29'
  keyserver 'keyserver.ubuntu.com'
  retries 3
end

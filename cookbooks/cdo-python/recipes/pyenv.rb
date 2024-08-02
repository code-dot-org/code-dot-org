apt_package 'git'

file '/etc/profile.d/pyenv_path.sh' do
  content <<~EOH
    #!/bin/sh
    export PATH="/usr/local/pyenv/bin:$PATH"
  EOH
  mode '0755'
  owner 'root'
  group 'root'
end

git "/usr/local/pyenv" do
  repository 'https://github.com/pyenv/pyenv.git'
  user user
  group user
  action :sync
end

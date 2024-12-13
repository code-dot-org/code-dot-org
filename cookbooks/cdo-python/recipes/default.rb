apt_package 'curl'

execute 'install uv' do
  command 'curl -LsSf https://astral.sh/uv/install.sh | XDG_BIN_HOME=/usr/local/bin UV_NO_MODIFY_PATH=1 sh'
  not_if 'which uv'
end

apt_package 'curl'

execute 'install uv' do
  # By default uv's install.sh will install to the user's homedir and modify the user's PATH.
  # Instead we wish to install uv to /usr/local/bin, which is already in the PATH.
  command 'curl -LsSf https://astral.sh/uv/0.5.18/install.sh | XDG_BIN_HOME=/usr/local/bin UV_NO_MODIFY_PATH=1 sh'
  not_if 'which uv'
end

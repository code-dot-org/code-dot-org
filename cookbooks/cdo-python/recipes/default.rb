apt_package 'python3-pip'

execute 'install pdm' do
  command 'pip install --system --prefix=/usr/local pdm'
  not_if 'pip show pdm'
end

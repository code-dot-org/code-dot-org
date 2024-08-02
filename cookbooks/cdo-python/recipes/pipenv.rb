apt_package 'python3-pip'

execute 'install pipenv' do
  command 'pip install pipenv --prefix=/usr/local'
  not_if 'pip show pipenv'
end

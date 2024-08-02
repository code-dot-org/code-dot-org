describe command('which pipenv') do
  its('exit_status') {should eq 0}
end

describe command('PATH="/usr/local/pyenv/bin:$PATH" which pyenv') do
  its('exit_status') {should eq 0}
end

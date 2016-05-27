require 'serverspec'
set :backend, :exec

def cmd(exec, match)
  describe command(exec), sudo: false do
    its(:stdout) { should match match }
  end
end

cmd 'git --version', '1.9.1'
cmd 'cd ${HOME}/adhoc; git status', 'On branch staging'

require 'serverspec'
set :backend, :exec

def file_exist(file)
  describe file(file) do
    it { should exist }
  end
end

def cmd(exec, match)
  describe command(exec) do
    its(:stdout) { should match match }
  end
end

# Run a command within the docker container.
# necessary because the docker host may be located outside of the test-kitchen container.
def docker_cmd(exec, match)
  exec = "sudo /bin/bash -c 'docker exec $(docker ps -q --filter \\'name=app\\') #{exec}'"
  cmd(exec, match)
end

file_exist '/var/discourse/launcher'
docker_cmd 'curl localhost -H "Host: forum.code.org"', 'Discourse'
docker_cmd 'curl localhost -H "Host: discourse.code.org"', 'Discourse'

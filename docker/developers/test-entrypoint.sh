# This runs when the test-web container starts

# We start an SSH server so we can remotely run commands on the test container 
sudo service ssh restart

# We run a code-dot-org server
exec /bin/bash -l -c './bin/dashboard-server'

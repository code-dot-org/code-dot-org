# Run this recipe to ensure the nginx service is stopped.
service 'nginx' do
  action :nothing

  # Nginx upstart scripts are broken in Ubuntu 14.04, so force non-Upstart scripts.
  # Ref: https://bugs.launchpad.net/nginx/+bug/1476296
  provider Chef::Provider::Service::Debian
  only_if { File.exist? '/etc/init.d/nginx' }
end.run_action(:stop) # Run in compile-phase prior to app-service restart.

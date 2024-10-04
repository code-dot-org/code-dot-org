# Install the tool that syncs content between the Dropbox directory and the git
# repository. Also configure rotation for the tool's fairly verbose logs,
# including logic to back them up to S3.
apt_package 'unison'
file '/etc/logrotate.d/unison' do
  content <<~LOGROTATE
    #{File.join(node[:home], 'unison.log')} {
      daily
      rotate 15
      dateext
      compress
      missingok
      notifempty
      copytruncate
      prerotate
        INSTANCE_ID="`wget -q -O - http://instance-data/latest/meta-data/instance-id`"
        /usr/local/bin/aws s3 cp $1 "s3://cdo-logs/#{node.chef_environment}-misc-logs/${INSTANCE_ID}/$(date +%F)$1"
      endscript
    }
  LOGROTATE
  mode '0644'
  owner 'root'
  group 'root'
end

# Check whether the tool that syncs content between Dropbox's servers and our
# local Dropbox directory is installed, and display instructions for how to do
# so if it isn't. Ideally, we would be able to install the tool with this code,
# but the process is sufficiently interactive and we have to do it sufficiently
# rarely that we think documentation will suffice for now.
dropbox_daemon_file = File.join(node[:home], '.dropbox-dist/dropboxd')
unless File.exist?(dropbox_daemon_file)
  environment_name = node.chef_environment.inspect
  Chef.event_handler do
    on :run_completed do
      Chef::Log.warn("Chef environment #{environment_name} expects the Dropbox Daemon to be configured.")
      Chef::Log.warn('Follow the instructions at https://www.dropbox.com/install-linux to do so')
    end
  end
end

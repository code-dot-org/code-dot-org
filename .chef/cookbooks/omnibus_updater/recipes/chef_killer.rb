ruby_block 'omnibus chef killer' do
  block do
    upgrade_behavior = node[:omnibus_updater][:upgrade_behavior]
    if upgrade_behavior == 'exec'
      if Chef::Config[:interval]
        Chef::Log.warn 'omnibus_updater "exec" not supported for long-running client process -- changing to "kill".'
        upgrade_behavior = 'kill'
      end
      unless Process.respond_to?(:exec)
        Chef::Log.warn 'omnibus_updater Process.exec not available -- changing to "kill".'
        upgrade_behavior = 'kill'
      end
    end

    case upgrade_behavior
      when 'exec'
        if Chef::Config[:local_mode]
          Chef::Log.info 'Shutting down local-mode server.'
          if Chef::Application.respond_to?(:destroy_server_connectivity)
            Chef::Application.destroy_server_connectivity
          elsif defined?(Chef::LocalMode) && Chef::LocalMode.respond_to?(:destroy_server_connectivity)
            Chef::LocalMode.destroy_server_connectivity
          end
        end
        Chef::Log.warn 'Replacing ourselves with the new version of Chef to continue the run.'
        exec(node[:omnibus_updater][:exec_command], *node[:omnibus_updater][:exec_args])
      when 'kill'
        if Chef::Config[:client_fork] && Process.ppid != 1
          Chef::Log.warn 'Chef client is defined for forked runs. Sending TERM to parent process!'
          Process.kill('TERM', Process.ppid)
        end
        Chef::Application.exit!('New omnibus chef version installed. Forcing chef exit!')
      else
        raise "Unexpected upgrade behavior: #{node[:omnibus_updater][:upgrade_behavior]}"
    end
  end
  action :nothing
end

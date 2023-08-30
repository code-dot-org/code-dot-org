module CdoApps
  def setup_app(app_name)
    user = node[:user]
    home = node[:home]
    root = File.join home, node.chef_environment
    app_root = File.join root, app_name
    unit_file = "/lib/systemd/system/#{app_name}.service"

    utf8 = 'en_US.UTF-8'
    env = {
      'LC_ALL' => utf8,
      'LANGUAGE' => utf8,
      'LANG' => utf8,
      'RAILS_ENV' => node.chef_environment,
      'TZ' => 'UTC', # Workaround for lack of zoneinfo directory in docker: https://forums.docker.com/t/synchronize-timezone-from-host-to-container/39116/3
    }
    execute "setup-#{app_name}" do
      command "bundle exec rake #{app_name}:setup_db --trace"
      cwd app_root
      environment env.merge(node['cdo-apps']['bundle_env'])
      live_stream true
      user user
      group user
      timeout 7200 # The default 3600 seconds is often not sufficient when the database is configured as an RDS cluster.
      action :nothing
    end

    # Bootstrap `setup_db` on a new system.
    # Runs only once on initial install.
    file "#{app_name}_setup" do
      path "#{Chef::Config[:file_cache_path]}/#{app_name}_setup"
      notifies :run, "execute[setup-#{app_name}]", :immediately
      only_if {node['cdo-apps']['local_mysql'] || node['cdo-apps']['daemon']}
    end

    # Set up a SystemD service to monitor the web server process.
    template unit_file do
      app_server = node['cdo-apps']['app_server']
      src_file = "#{app_root}/config/#{app_server}.rb"
      export_env = node['cdo-apps']['bundle_env'].merge(node['cdo-apps'][app_name]['env'] || {})

      user 'root'
      group 'root'
      mode '0755'

      variables app_name: app_name,
        app_root: app_root,
        env: node.chef_environment,
        export_env: export_env,
        src_file: src_file,
        user: user
      source "#{app_server}.service.erb"

      notifies :run, "execute[restart #{app_name} service]", :delayed
    end

    # TODO: remove this once all persistent managed servers have been cleaned up
    old_init_script = "/etc/init.d/#{app_name}"
    execute "remove old SysV #{app_name} implementation" do
      command "#{old_init_script} stop && mv #{old_init_script} /tmp/old-init-d-#{app_name}"
      only_if {::File.exist?(old_init_script)}
      notifies :run, "execute[restart #{app_name} service]", :delayed
    end

    # Define an execute resource for restarting (or starting) the entire
    # SystemD service, which can be invoked by other Chef resources
    execute "restart #{app_name} service" do
      command "systemctl daemon-reload && systemctl restart #{app_name}"

      # Don't run by default; rely on notifications.
      action :nothing

      # Restart when Ruby is upgraded.
      subscribes :run, "apt_package[ruby#{node['cdo-ruby']['version']}]", :delayed if node['cdo-ruby']

      # Reload when gem bundle is updated.
      subscribes :run, 'execute[bundle-install]', :delayed

      # Reload when application is rebuilt.
      subscribes :run, 'execute[build-cdo]', :delayed

      # Reload when global config is updated to pick up changes.
      subscribes :run, 'template[globals]', :delayed

      # Ensure globals.yml is up-to-date before (re)starting service.
      notifies :create, 'template[globals]', :before

      only_if {File.exist? unit_file}
    end

    # We always want to restart the web server process whenever port/socket
    # listener configuration is changed, so create a file with that information
    # as its contents and invoke the restart whenever those contents change.
    file "#{app_name}_listeners" do
      path "#{Chef::Config[:file_cache_path]}/#{app_name}_listeners"
      content(lazy {"#{node['cdo-secrets']["#{app_name}_sock"]}:#{node['cdo-secrets']["#{app_name}_port"]}"})
      notifies :run, "execute[restart #{app_name} service]", :immediately
    end

    log_dir = File.join app_root, 'log'
    directory log_dir do
      recursive true
      user user
      group user
    end

    template "/etc/logrotate.d/#{app_name}" do
      source 'logrotate.erb'
      user 'root'
      group 'root'
      mode '0644'
      variables app_name: app_name,
        log_dir: log_dir
    end

    if node['cdo-newrelic']
      template "#{app_root}/config/newrelic.yml" do
        source 'newrelic.yml.erb'
        user user
        group user
        variables app_name: app_name.capitalize,
          log_dir: log_dir,
          auto_instrument: false
      end
    end
  end
end

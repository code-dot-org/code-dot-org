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

    # Make sure the directory for our sockets exists and is writable by the app
    # server user. This used to happen as a side effect ofo the old SysV Init
    # script, but now that we're just using systemd directly we need to do this
    # manually.
    socket_path = node['cdo-apps']['nginx_enabled'] && node['cdo-nginx']['socket_path']
    directory socket_path do
      action :create
      owner user
      recursive true
    end

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

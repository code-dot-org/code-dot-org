module CdoApps
  def setup_app(app_name)
    user = node[:user]
    home = node[:home]
    root = File.join home, node.chef_environment
    app_root = File.join root, app_name
    init_script = "/etc/init.d/#{app_name}"
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
      action :nothing
    end

    # Bootstrap `setup_db` on a new system.
    # Runs only once on initial install.
    file "#{app_name}_setup" do
      path "#{Chef::Config[:file_cache_path]}/#{app_name}_setup"
      notifies :run, "execute[setup-#{app_name}]", :immediately
      only_if {node['cdo-apps']['local_mysql'] || node['cdo-apps']['daemon']}
    end

    socket_path = node['cdo-apps']['nginx_enabled'] && node['cdo-nginx']['socket_path']

    template unit_file do
      app_server = node['cdo-apps']['app_server']

      user 'root'
      group 'root'
      mode '0755'

      variables app_name: app_name
      source "#{app_server}.service.erb"
    end

    template init_script do
      app_server = node['cdo-apps']['app_server']
      src_file = "#{app_root}/config/#{app_server}.rb"

      source "#{app_server}.sh.erb"
      user 'root'
      group 'root'
      mode '0755'
      variables src_file: src_file,
        app_name: app_name,
        app_root: app_root,
        pid_file: "#{src_file}.pid",
        socket_path: socket_path,
        user: user,
        env: node.chef_environment,
        export_env: node['cdo-apps']['bundle_env'].
          merge(node['cdo-apps'][app_name]['env'] || {})
      notifies :reload, "service[#{app_name}]", :delayed
    end

    # Stop before and start after changes to significant init-script attributes.
    file "#{app_name}_app_server" do
      action :nothing
      path "#{Chef::Config[:file_cache_path]}/#{app_name}_app_server"
      content "#{node['cdo-apps']['app_server']}:#{socket_path}"

      # Stop service before init-script update, and start service afterwards.
      subscribes :create, "template[#{init_script}]", :before
      notifies :stop, "service[#{app_name}]", :immediately
      notifies :start, "service[#{app_name}]", :delayed
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

    service app_name do
      supports reload: true
      reload_command "#{init_script} upgrade"
      action [:enable]

      # Restart when Ruby is upgraded.
      # Full restart needed because the path to app-server executable changed.
      subscribes :restart, "apt_package[ruby#{node['cdo-ruby']['version']}]", :delayed if node['cdo-ruby']

      # Reload when gem bundle is updated.
      subscribes :reload, 'execute[bundle-install]', :delayed

      # Reload when application is rebuilt.
      subscribes :reload, 'execute[build-cdo]', :delayed

      # Reload when global config is updated to pick up changes.
      subscribes :reload, 'template[globals]', :delayed

      # Ensure globals.yml is up-to-date before (re)starting service.
      notifies :create, 'template[globals]', :before
      only_if {File.exist? init_script}
    end

    # Always reload service whenever port/socket listener configuration is changed.
    file "#{app_name}_listeners" do
      path "#{Chef::Config[:file_cache_path]}/#{app_name}_listeners"
      content lazy {"#{node['cdo-secrets']["#{app_name}_sock"]}:#{node['cdo-secrets']["#{app_name}_port"]}"}
      notifies :reload, "service[#{app_name}]", :immediately
    end
  end
end

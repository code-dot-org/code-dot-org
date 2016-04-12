# Manages the user crontab for scheduled apps-related tasks.
root = File.join node[:home], node.chef_environment
bin = File.join root, 'bin'

def cronjob(m:nil, at:nil, cmd:, h:nil, notify:'')
  cron cmd do
    time at if at
    minute m.to_s if m
    hour h.to_s if h
    user node[:user]
    root = File.join node[:home], node.chef_environment
    bin = File.join root, 'bin'
    environment node['cdo-apps']['bundle_env']
    require 'shellwords'
    command "bundle exec #{bin}/cronjob #{cmd.shellescape} #{notify}"
    mailto 'dev+crontab@code.org'
  end
end

# for multi-instance envs (ie production) there should be one daemon,
# so cronjobs that run once per environment go here (standalone env
# instances are all their own daemon)
if node['cdo-apps']['daemon']
  unless node.chef_environment == 'production' # non-production daemons
    cronjob at: :reboot, cmd: "#{bin}/solr-server > #{root}/pegasus/log/solr.log 2>&1"
  end

  if node.chef_environment == 'staging' && node.name == 'staging' # 'real' staging only
    cronjob at: :reboot,  cmd: "#{node[:home]}/.dropbox-dist/dropboxd"
    cronjob m: '*/2',     cmd: "#{root}/pegasus/sites/virtual/run_server_generate_curriculum_pdfs", notify: 'dev+crontab@code.org'
    cronjob m: '*/2',     cmd: "#{root}/pegasus/sites/virtual/collate_pdfs", notify: 'dev+crontab@code.org'
    cronjob m: '*/2',     cmd: "#{root}/dashboard/bin/build_scripts", notify: 'dev+crontab@code.org'
    cronjob m: '*/2',     cmd: "#{bin}/run_server_generate_pdfs", notify: 'dev+crontab@code.org'
    cronjob m: '*/5',     cmd: "#{bin}/fetch-external-resources", notify: 'dev+crontab@code.org'
    cronjob m: '*/5',     cmd: "#{bin}/import_google_sheets"
    cronjob h: 16, m: 30, cmd: "#{bin}/cron/update_dotd"
  end

  if node.chef_environment == 'production' # production daemon
    cronjob m: '*/1',        cmd: "#{bin}/index-users-in-solr"
    cronjob h: 6,  m: 5,     cmd: "#{bin}/send_workshop_reminder_emails"
    cronjob h: 7,  m: 25,    cmd: "#{bin}/update-hoc-map"
    cronjob h: 16, m: 15,    cmd: "#{root}/dashboard/bin/scheduled_ops_emails"
    cronjob h: '*/2', m: 20, cmd: "#{bin}/cron/activity-monitor"
  end

  # 'daemons' in all environments
  cronjob m: '*/1',    cmd: "#{bin}/process_forms"
  cronjob m: '*/1',    cmd: "#{bin}/deliver_poste_messages"
  cronjob m: '*/1',    cmd: "#{bin}/geocode_hoc_activity"
  cronjob m: 35,       cmd: "#{bin}/cron/analyze_hoc_activity"
  cronjob h: 8, m: 55, cmd: "#{bin}/cron/ops_data_pull"
  cronjob h: 5, m: 45, cmd: "#{bin}/cron/admin_stats"
  cronjob h: 4, m: 40, cmd: "#{bin}/cron/funometer"
  cronjob h: 6, m: 30, cmd: "#{bin}/cron/admin_progress"
  cronjob h: 7, m: 10, cmd: "#{bin}/cron/retention_stats"
  cronjob m: '*/1',    cmd: "#{root}/aws/ci_build", notify: 'dev+build@code.org'
end

# cronjobs that run on all instances in all environments go here:

# Restart Pegasus and dashboard every 8 hours at 0, 8, 16 UTC (12AM, 8AM, 4PM).
# The restart interval from from every 4 hours on 2016/4/26. After recent memory
# leak fixes this is probably no longer necessary, but we are keeping it at this
# level until we have chance to confirm non-leakage over longer intervals.
cronjob h: '*/8', m: rand(20), cmd: 'service dashboard upgrade && service pegasus upgrade'

cronjob m: rand(60), cmd: "#{bin}/upload-logs-to-s3 dashboard pegasus"
cronjob at: '@reboot', do: 'chef-client'

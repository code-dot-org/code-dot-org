def bin_dir(*paths)
  pegasus_dir('sites.v3', 'code.org', 'bin', *paths)
end

unless rack_env?(:production)
  cronjob at:'@reboot', do:"#{aws_dir('solr_server')} 2>&1 > #{pegasus_dir('log','solr.log')}"
end

if rack_env?(:staging)
  cronjob at:'@reboot', do:'$HOME/.dropbox-dist/dropboxd'

  cronjob at:'*/2 * * * *', do:bin_dir('import_google_sheets')
  cronjob at:'*/2 * * * *', do:pegasus_dir('sites/virtual/run_server_generate_curriculum_pdfs'), notify:'brian@code.org'
  cronjob at:'*/2 * * * *', do:pegasus_dir('sites/virtual/collate_pdfs'), notify:'brian@code.org'
  cronjob at:'*/2 * * * *', do:dashboard_dir('bin/build_scripts'), notify:'dev@code.org'
  cronjob at:'*/5 * * * *', do:deploy_dir('bin/fetch-external-resources'), notify:'dev@code.org'
end

if rack_env?(:production)
  cronjob at:'*/15 * * * *', do:deploy_dir('bin/activity-monitor')
  cronjob at:'0 * * * *', do:bin_dir('import_sendy_unsubscribers')
  cronjob at:'30 2 * * *', do:bin_dir('export_mailing_lists')
  cronjob at:'45 2 * * *', do:bin_dir('export_to_google_drive')
end

cronjob at:'*/1 * * * *', do:bin_dir('process_forms')
cronjob at:'*/5 * * * *', do:bin_dir('analyze_hoc_activity')
cronjob at:'*/1 * * * *', do:bin_dir('deliver_poste_messages')
cronjob at:'*/1 * * * *', do:"#{bin_dir('geocode_hoc_activity')} > /dev/null 2>&1"

build_target = rack_env?(:test) ? 'test-websites' : 'websites'
cronjob at:'*/1 * * * *', do:"#{aws_dir('build_and_mail_log')} #{build_target}", notify:'dev+build@code.org'

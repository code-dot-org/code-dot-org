require_relative '../../deployment'
require 'cdo/hip_chat'
require 'cdo/rake_utils'

namespace :firebase do
  desc 'Compile firebase security rules and store them in the apps package.'
  task :compile_rules do
    if rack_env?(:production)
      raise "Cannot compile firebase security rules on production, because npm is not installed.\n"\
        "Instead, upload security rules from the apps package which was downloaded from s3."
    end
    Dir.chdir(apps_dir) { RakeUtils.system 'grunt compile-firebase-rules' }
  end

  desc 'Uploads compiled security rules to firebase from the apps package.'
  task :upload_rules do
    if CDO.firebase_name
      HipChat.log 'Uploading security rules to firebase...'
      Dir.chdir(dashboard_dir) {
        if rack_env?(:development) && !`ls -l public/blockly`.include?('apps/build/package')
          STDERR.puts "\nWARNING: you are uploading firebase rules from the precompiled apps package.\n"\
            "To upload the firebase rules you built using `rake firebase:compile_rules`, you will need to\n"\
            "set `use_my_apps: true` in locals.yml and then run `rake package:apps:symlink`.\n\n"
        end
        url = "https://#{CDO.firebase_name}.firebaseio.com/.settings/rules.json?auth=#{CDO.firebase_secret}"
        RakeUtils.system("curl -X PUT -T ./public/blockly/firebase/rules.json '#{url}'")
      }
    end
  end

  desc 'Sets config in the firebase database from CDO config params.'
  task :set_config do
    if CDO.firebase_name
      HipChat.log 'Setting firebase configuration parameters...'
      Dir.chdir(apps_dir) {
        url = "https://#{CDO.firebase_name}.firebaseio.com/v3/config.json?auth=#{CDO.firebase_secret}"
        config = {
          channels: {
            limits: {
              '15': CDO.firebase_max_channel_writes_per_15_sec,
              '60': CDO.firebase_max_channel_writes_per_60_sec
            },
            maxRecordSize: CDO.firebase_max_record_size,
            maxPropertySize: CDO.firebase_max_property_size,
            maxTableRows: CDO.firebase_max_table_rows
          }
        }
        RakeUtils.system("curl -X PUT -d '#{config.to_json}' '#{url}'")
      }
    end
  end

  task :all => [:compile_rules, :upload_rules, :set_config]
end

desc 'Compile and upload firebase rules, and set firebase config.'
task :firebase => ['firebase:all']

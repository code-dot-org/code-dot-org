require_relative '../../deployment'
require 'cdo/hip_chat'
require 'cdo/rake_utils'

namespace :firebase do
  desc 'Uploads compiled security rules to firebase from the apps package.'
  task :upload_rules do
    if CDO.firebase_name
      HipChat.log 'Uploading security rules to firebase...'
      Dir.chdir(apps_dir) {
        url = "https://#{CDO.firebase_name}.firebaseio.com/.settings/rules.json?auth=#{CDO.firebase_secret}"
        RakeUtils.system("curl -X PUT -T ./build/package/firebase/rules.json '#{url}'")
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
end

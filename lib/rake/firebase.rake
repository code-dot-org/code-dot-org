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

  desc 'Sets global constants in the firebase database from CDO config params.'
  task :set_constants do
    if CDO.firebase_name
      HipChat.log 'Setting firebase constants...'
      Dir.chdir(apps_dir) {
        url = "https://#{CDO.firebase_name}.firebaseio.com/v3/constants.json?auth=#{CDO.firebase_secret}"
        constants = {
            channels: {
                limits: {
                    '15': CDO.firebase_max_channel_writes_per_15_sec,
                    '60': CDO.firebase_max_channel_writes_per_60_sec
                },
                maxTableRows: CDO.firebase_max_table_rows
            }
        }
        RakeUtils.system("curl -X PUT -d '#{constants.to_json}' '#{url}'")
      }
    end
  end
end

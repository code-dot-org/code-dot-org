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
end

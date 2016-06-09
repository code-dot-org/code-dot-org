#!/usr/bin/env ruby

require_relative '../../deployment'

# Upload firebase rules from rules.json to the firebase specified in
# CDO.firebase_name, using CDO.firebase_secret for authentication.

url = "https://#{CDO.firebase_name}.firebaseio.com/.settings/rules.json?auth=#{CDO.firebase_secret}"
system("curl -X PUT -T ../build/package/firebase/rules.json '#{url}'")
puts ''
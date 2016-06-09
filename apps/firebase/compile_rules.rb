#!/usr/bin/env ruby

# Compiles firebase rules from rules.yaml to rules.json using bolt.
# Note: bolt is installed via npm, which is not available on
# production machines.

if `which firebase-bolt`.empty?
  puts "Cannot find firebase-bolt. Please run `npm install` from the apps/ directory."
  exit(1)
end
`mkdir -p ../build/package/firebase`
`firebase-bolt < rules.bolt > ../build/package/firebase/rules.json`

#!/usr/bin/env ruby

# Compiles firebase rules from rules.yaml to rules.json using blaze.
# Note: blaze is installed via npm, which is not available on
# production machines.

if `which blaze`.empty?
  puts "Cannot find blaze. Please run `npm install` from the apps/ directory."
  exit(1)
end

`blaze rules.yaml`

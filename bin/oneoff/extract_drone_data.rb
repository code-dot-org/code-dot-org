#!/usr/bin/env ruby
require 'aws-sdk-s3'
require 'parallel'

def download_database
  # Double-escape the command string, once for each remote shell we're passing
  # through.
  command = "ssh -t gateway.code.org 'cd ~/ && scp -i ~/.ssh/drone_access_key ec2-user@18.237.89.133:/var/lib/drone/database.sqlite .'"
  puts command
  test = system command
  puts test
  return true if test
  # Non-zero exit code from the command
  puts "There was an error running `#{command}`"
  return false
end

download_database

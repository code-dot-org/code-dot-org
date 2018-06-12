#!/usr/bin/env ruby
require_relative '../../deployment'

def main
  `pkill -9 -f brokenLinkChecker`
  exec(deploy_dir('tools', 'scripts', 'brokenLinkChecker', 'brokenLinkChecker.js'))
end

main

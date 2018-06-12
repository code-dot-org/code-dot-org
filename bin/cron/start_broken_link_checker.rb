#!/usr/bin/env ruby
require File.expand_path('../../../pegasus/src/env', __FILE__)

def main
  `pkill -9 -f brokenLinkChecker`
  deploy_dir('tools', 'scripts', 'brokenLinkChecker', 'brokenLinkChecker.js')
end

main

$LOAD_PATH.unshift File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift File.expand_path('../shared/middleware', __FILE__)

# Set up gems listed in the Gemfile.
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __FILE__)
require 'bundler/setup' if File.exist?(ENV['BUNDLE_GEMFILE'])

require 'cdo/git_utils'
require 'uri'
require 'cdo'
require 'cdo/aws/config'

####################################################################################################
##
## Helpers
##
##########

def rack_env
  CDO.rack_env.to_sym
end

def rack_env?(*env)
  e = *env
  e.include? rack_env.to_sym
end

def with_rack_env(temporary_env)
  require 'mocha/api'
  CDO.stubs(rack_env: temporary_env)
  yield
  CDO.unstub(:rack_env)
end

def deploy_dir(*dirs)
  CDO.dir(*dirs)
end

def aws_dir(*dirs)
  deploy_dir('aws', *dirs)
end

def apps_dir(*dirs)
  deploy_dir('apps', *dirs)
end

def tools_dir(*dirs)
  deploy_dir('tools', *dirs)
end

def cookbooks_dir(*dirs)
  deploy_dir('cookbooks', *dirs)
end

def dashboard_dir(*dirs)
  deploy_dir('dashboard', *dirs)
end

def pegasus_dir(*paths)
  deploy_dir('pegasus', *paths)
end

def shared_dir(*dirs)
  deploy_dir('shared', *dirs)
end

def shared_js_dir(*dirs)
  deploy_dir('shared/js', *dirs)
end

def lib_dir(*dirs)
  deploy_dir('lib', *dirs)
end

def bin_i18n_dir(*dirs)
  deploy_dir('bin/i18n', *dirs)
end

def shared_constants_dir(*dirs)
  lib_dir('cdo', 'shared_constants', *dirs)
end

def shared_constants_file
  lib_dir('cdo', 'shared_constants.rb')
end

# # Loads a subset of the Dashboard models, including dependencies, without the rest of Rails,
# # and sets up the ActiveRecord db connection.
# # This loads much faster than the entire Rails environment.
#
# def prepend_load_paths(*paths)
#   paths.each do |path|
#     next if $LOAD_PATH.include? path
#     $LOAD_PATH.unshift File.expand_path(path)
#   end
# end
#
# require 'action_dispatch'
# prepend_load_paths '.', '../lib', 'lib'
# require 'active_record'
# require 'active_support'
# require_relative '../deployment'
#
# require 'cancan'
# require 'retryable'
# require 'seamless_database_pool'
# require 'no_utf8mb4_validator'
# require 'validates_email_format_of'
# require 'app/models/concerns/serialized_properties'
# require 'app/helpers/locale_helper'
# require 'paranoia'
# require 'devise'
# require 'devise_invitable'
#
# # Fake Rails application, needed before initializers and after the prior requires.
# module Rails
#   def Rails.application
#     @@app ||= OpenStruct.new({
#       routes: ActionDispatch::Routing::RouteSet.new
#     })
#   end
#
#   def Rails.root
#     @@root ||= Dir.pwd
#   end
# end
#
# # Load necessary initializers
# require 'config/initializers/devise'
#
# # Configure DB connection
# db_config = YAML.load(ERB.new(File.read("#{Rails.root}/config/database.yml")).result)
# ActiveRecord::Base.establish_connection db_config[Rails.env]
#
# # Now, finally, selectively load the models we care about
# prepend_load_paths 'app/models'
# require 'user'
# require 'school_info'
#
# require 'pd'
# prepend_load_paths 'app/models/pd'
# require 'workshop'
# require 'session'
# require 'enrollment'
# require 'course_facilitator'

# Common settings shared across unit tests for shared, pegasus, lib
ENV['RACK_ENV'] = 'test'

require 'minitest/autorun'
require 'rack/test'
require 'minitest/reporters'
require 'minitest/around/unit'
require 'mocha/mini_test'
require_relative '../../deployment'

raise 'Test helper must only be used in `test` environment!' unless rack_env? :test

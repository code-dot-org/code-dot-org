# encoding: UTF-8
# -*- mode: ruby -*-
# vi: set ft=ruby :

# More info at http://bundler.io/gemfile.html

source 'https://rubygems.org'

chef_version = ENV.key?('CHEF_VERSION') ? ENV['CHEF_VERSION'] : nil

group :doc do
  gem 'yard', '~> 0.8'
end

group :test do
  gem 'rake'
  gem 'berkshelf', '~> 4.0'
end

group :style do
  gem 'foodcritic', '~> 5.0.0'
  gem 'rubocop', '~> 0.35.0'
end

group :unit do
  gem 'chef', chef_version unless chef_version.nil? # Ruby 1.9.3 support
  gem 'simplecov', '~> 0.9'
  gem 'should_not', '~> 1.1'
  gem 'chefspec', '~> 4.1'
  gem 'chef-vault', '~> 2.4'
end

group :integration do
  gem 'test-kitchen', '~> 1.4'
end

group :integration_docker do
  gem 'kitchen-docker', '~> 2.1'
end

group :integration_vagrant do
  gem 'vagrant-wrapper', '~> 2.0'
  gem 'kitchen-vagrant', '~> 0.10'
end

group :integration_cloud do
  gem 'kitchen-ec2', '~> 0.8'
  gem 'kitchen-digitalocean', '~> 0.8'
end

group :guard do
  gem 'guard', '~> 2.12'
  gem 'guard-foodcritic', '~> 2.0'
  gem 'guard-rubocop', '~> 1.2'
  gem 'guard-rspec', '~> 4.6'
  # Temporary disabled: Error is: cannot load such file -- guard/kitchen
  # gem 'guard-kitchen', '~> 0.0.0'
end

group :travis do
  gem 'coveralls', '~> 0.7', require: false
end

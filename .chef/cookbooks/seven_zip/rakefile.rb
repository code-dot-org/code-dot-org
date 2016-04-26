require 'rubocop/rake_task'
require 'foodcritic'
require 'rspec/core/rake_task'

@provider = (ENV['PROVIDER'] || :virtualbox).to_sym

task default: [:version, :rubocop, :foodcritic, :spec]

task :version do
  version = ENV['BUILD_NUMBER'] ? "2.0.#{ENV['BUILD_NUMBER']}" : '2.0.0'
  IO.write('version.txt', version)
end

FoodCritic::Rake::LintTask.new do |t|
  t.options = { cookbook_paths: '.', search_gems: true }
end

RSpec::Core::RakeTask.new do |task|
  task.pattern = 'spec/**/*_spec.rb'
  task.rspec_opts = ['--color', '-f documentation', '-tunit']
end

RuboCop::RakeTask.new

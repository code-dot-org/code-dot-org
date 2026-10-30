require 'test_helper'

# Guards the invariant that config/database.yml declares every database ApplicationRecord connects to, in every
# environment. Read splitting used to be conditional: `primary_replica` was omitted wherever the reader and writer
# credentials matched, which silently left local development, continuous integration builds and adhocs without one.
class DatabaseConfigurationTest < ActiveSupport::TestCase
  # `include_hidden` rather than the `include_replicas` kwarg it replaced, which is deprecated in Rails 7.0.
  CONFIGS = ActiveRecord::Base.configurations.configs_for(env_name: Rails.env, include_hidden: true).freeze

  test 'declares every database ApplicationRecord connects to' do
    assert_equal %w[primary primary_replica primary_reporting].sort, CONFIGS.map(&:name).sort
  end

  test 'declares the reader databases as replicas' do
    %w[primary_replica primary_reporting].each do |name|
      config = CONFIGS.find {|candidate| candidate.name == name}
      assert config.replica?, "#{name} must be declared `replica: true`"
    end
  end

  test 'connects the reader databases as a different SQL user than the writer' do
    # Where there is no Aurora cluster the reader endpoint names the same MySQL server as the writer, so the SQL user
    # is the only thing separating a read connection from a write connection.
    writer = CONFIGS.find {|config| config.name == 'primary'}
    %w[primary_replica primary_reporting].each do |name|
      reader = CONFIGS.find {|config| config.name == name}
      refute_equal writer.configuration_hash[:username], reader.configuration_hash[:username],
        "#{name} must not connect as the writer's SQL user"
    end
  end
end

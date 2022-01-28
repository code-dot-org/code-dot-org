require 'test_helper'

class ProgrammingEnvironmentTest < ActiveSupport::TestCase
  test "can create programming environment" do
    programming_environment = create :programming_environment
    assert programming_environment.name
  end

  test "can serialize and seed programming environment" do
    env = create :programming_environment, name: 'ide', editor_type: 'droplet', title: 'IDE', description: 'A description of the IDE.', image_url: 'images.code.org/ide'
    serialization = env.serialize
    previous_env = env.freeze
    env.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_env_name = ProgrammingEnvironment.seed_record("config/programming_environments/ide.json")
    new_env = ProgrammingEnvironment.find_by_name(new_env_name)
    assert_equal previous_env.attributes.except('id', 'created_at', 'updated_at'), new_env.attributes.except('id', 'created_at', 'updated_at')
  end
end

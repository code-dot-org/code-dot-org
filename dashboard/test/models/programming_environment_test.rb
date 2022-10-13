require 'test_helper'

class ProgrammingEnvironmentTest < ActiveSupport::TestCase
  test "can create programming environment" do
    programming_environment = create :programming_environment
    assert programming_environment.name
  end

  test "enforces name format" do
    programming_environment = create :programming_environment, name: 'simple-name'
    assert programming_environment.valid?

    programming_environment.update(name: "NaMeWiThUpCaSe")
    refute programming_environment.valid?
    assert_equal [{error: :invalid, value: "NaMeWiThUpCaSe"}],
      programming_environment.errors.details[:name]

    programming_environment.update(name: "name~with/invalid characters")
    refute programming_environment.valid?
    assert_equal [{error: :invalid, value: "name~with/invalid characters"}],
      programming_environment.errors.details[:name]
  end

  test "can serialize and seed programming environment" do
    env = create :programming_environment, name: 'ide', editor_language: 'droplet', title: 'IDE', description: 'A description of the IDE.', image_url: 'images.code.org/ide'
    serialization = env.serialize
    previous_env = env.freeze
    env.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_env_name = ProgrammingEnvironment.seed_record("config/programming_environments/ide.json")
    new_env = ProgrammingEnvironment.find_by_name(new_env_name)
    assert_equal previous_env.attributes.except('id', 'created_at', 'updated_at'), new_env.attributes.except('id', 'created_at', 'updated_at')
  end

  test "can serialize and seed programming environment with categories" do
    env = create :programming_environment, name: 'ide', editor_language: 'droplet', title: 'IDE', description: 'A description of the IDE.', image_url: 'images.code.org/ide'
    create :programming_environment_category, programming_environment: env
    create :programming_environment_category, programming_environment: env
    serialization = env.serialize
    previous_env = env.freeze
    env.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_env_name = ProgrammingEnvironment.seed_record("config/programming_environments/ide.json")
    new_env = ProgrammingEnvironment.find_by_name(new_env_name)
    assert_equal previous_env.attributes.except('id', 'created_at', 'updated_at'), new_env.attributes.except('id', 'created_at', 'updated_at')
    assert_equal 2, new_env.categories.count
  end

  test "can remove categories when serializings and seeding programming environment with categories" do
    env = create :programming_environment, name: 'ide', editor_language: 'droplet', title: 'IDE', description: 'A description of the IDE.', image_url: 'images.code.org/ide'
    create :programming_environment_category, programming_environment: env
    serialization = env.serialize
    # Category not included in the serialization should be deleted on seed
    create :programming_environment_category, programming_environment: env
    assert_equal 2, env.categories.count

    File.stubs(:read).returns(serialization.to_json)

    ProgrammingEnvironment.seed_record("config/programming_environments/ide.json")
    env.categories.reload
    assert_equal 1, env.categories.count
  end
end

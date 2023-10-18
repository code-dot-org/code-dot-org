require 'test_helper'

class ProgrammingClassTest < ActiveSupport::TestCase
  test "can serialize and seed programming class" do
    programming_environment = create :programming_environment
    category = create :programming_environment_category, programming_environment: programming_environment, name: 'World', color: '#ABCDEF'
    programming_class = create :programming_class, key: 'myExp', examples: '[myexamples]', content: 'some content', programming_environment_id: programming_environment.id, programming_environment_category_id: category.id
    serialization = programming_class.serialize
    previous_programming_class = programming_class.freeze
    programming_class.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_class_id = ProgrammingClass.seed_record("config/programming_classes/#{programming_environment.name}/file.json")
    new_programming_class = ProgrammingClass.find(new_class_id)
    assert_equal previous_programming_class.attributes.except('id', 'created_at', 'updated_at'), new_programming_class.attributes.except('id', 'created_at', 'updated_at')
    assert_equal category, new_programming_class.programming_environment_category
  end

  test "can serialize and seed programming class with methods" do
    programming_environment = create :programming_environment
    category = create :programming_environment_category, programming_environment: programming_environment, name: 'World', color: '#ABCDEF'
    programming_class = create :programming_class, key: 'myExp', examples: '[myexamples]', content: 'some content', programming_environment_id: programming_environment.id, programming_environment_category_id: category.id
    create :programming_method, programming_class: programming_class
    create :programming_method, programming_class: programming_class
    serialization = programming_class.serialize
    previous_programming_class = programming_class.freeze
    programming_class.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_class_id = ProgrammingClass.seed_record("config/programming_classes/#{programming_environment.name}/file.json")
    new_programming_class = ProgrammingClass.find(new_class_id)
    assert_equal previous_programming_class.attributes.except('id', 'created_at', 'updated_at'), new_programming_class.attributes.except('id', 'created_at', 'updated_at')
    assert_equal category, new_programming_class.programming_environment_category
    assert_equal 2, new_programming_class.programming_methods.count
  end

  test "seed_all adds, updates, and removes programming classes" do
    programming_environment = create :programming_environment
    category = create :programming_environment_category, programming_environment: programming_environment, name: 'World', color: '#ABCDEF'
    create :programming_class, key: 'to_delete', programming_environment: programming_environment, programming_environment_category: category
    to_update = create :programming_class, key: 'to_update', name: 'Old Name', programming_environment: programming_environment, programming_environment_category: category
    to_create = build :programming_class, key: 'to_create', programming_environment: programming_environment, programming_environment_category: category

    Dir.stubs(:glob).returns(["#{programming_environment.name}/#{to_update.key}.json", "#{programming_environment.name}/#{to_create.key}.json"])

    to_update.name = "Updated name"
    File.stubs(:read).with("#{programming_environment.name}/#{to_update.key}.json").returns(to_update.serialize.to_json)
    File.stubs(:read).with("#{programming_environment.name}/#{to_create.key}.json").returns(to_create.serialize.to_json)
    File.stubs(:delete)

    to_create.destroy!
    to_update.reload
    assert_equal 'Old Name', to_update.name

    ProgrammingClass.seed_all

    to_update.reload
    refute_nil to_update
    assert_equal 'Updated name', to_update.name
    assert_equal 1, ProgrammingClass.where(programming_environment_id: programming_environment.id, key: 'to_update').count

    assert_equal 0, ProgrammingClass.where(programming_environment_id: programming_environment.id, key: 'to_delete').count

    assert_equal 1, ProgrammingClass.where(programming_environment_id: programming_environment.id, key: 'to_create').count
  end

  test 'summarize_programming_methods groups methods by overload' do
    programming_class = create :programming_class
    programming_method1 = create :programming_method, programming_class: programming_class
    create :programming_method, programming_class: programming_class, overload_of: programming_method1.key
    create :programming_method, programming_class: programming_class, overload_of: programming_method1.key
    programming_method2 = create :programming_method, programming_class: programming_class
    create :programming_method, programming_class: programming_class, overload_of: programming_method2.key
    programming_method3 = create :programming_method, programming_class: programming_class

    method_summary = programming_class.summarize_programming_methods

    assert_equal 3, method_summary.length
    assert_equal([programming_method1.key, programming_method2.key, programming_method3.key], method_summary.map {|m| m[:key]})
    assert_equal 2, method_summary[0][:overloads].length
    assert_equal 1, method_summary[1][:overloads].length
    assert_equal 0, method_summary[2][:overloads].length
  end
end

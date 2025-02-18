require 'test_helper'

class ProgrammingExpressionTest < ActiveSupport::TestCase
  test "can create programming expression" do
    programming_expression = create :programming_expression
    assert programming_expression.name
    assert programming_expression.key
  end

  test "programming expression can be added to a lesson" do
    lesson = create :lesson
    programming_expression = create :programming_expression, lessons: [lesson]
    assert_equal 1, programming_expression.lessons.length
    assert_equal 1, lesson.programming_expressions.length
  end

  test 'programming expression in lesson cannot be destroyed' do
    lesson = create :lesson
    programming_expression = create :programming_expression, lessons: [lesson]
    refute programming_expression.destroy
  end

  class KeyConstraintTests < ActiveSupport::TestCase
    setup do
      @programming_environment = create :programming_environment
    end

    test "programming expression key cannot be blank" do
      assert_raises ActiveRecord::RecordInvalid do
        ProgrammingExpression.create!(key: '', name: 'invalid block', programming_environment_id: @programming_environment.id)
      end
    end

    test "programming expression cannot key with invalid characters" do
      assert_raises ActiveRecord::RecordInvalid do
        ProgrammingExpression.create!(key: 'an invalid key', name: 'invalid block', programming_environment_id: @programming_environment.id)
      end
    end

    test "programming expression key cannot start with a period" do
      assert_raises ActiveRecord::RecordInvalid do
        ProgrammingExpression.create!(key: '.key', name: 'invalid block', programming_environment_id: @programming_environment.id)
      end
    end

    test "programming expression key cannot end with a period" do
      assert_raises ActiveRecord::RecordInvalid do
        ProgrammingExpression.create!(key: 'key.', name: 'invalid block', programming_environment_id: @programming_environment.id)
      end
    end

    test "programming expression key uniqueness ignores casing" do
      create :programming_expression, key: 'myBlock', programming_environment: @programming_environment
      assert_raises ActiveRecord::RecordInvalid do
        ProgrammingExpression.create!(key: 'myblock', name: 'invalid block', programming_environment_id: @programming_environment.id)
      end
    end
  end

  test "can serialize and seed programming expression" do
    programming_environment = create :programming_environment
    category = create :programming_environment_category, programming_environment: programming_environment, name: 'World', color: '#ABCDEF'
    exp = create :programming_expression, key: 'myExp', category: 'World', examples: 'myexamples', palette_params: 'some parameters', programming_environment_id: programming_environment.id, programming_environment_category_id: category.id
    serialization = exp.serialize
    previous_exp = exp.freeze
    exp.destroy!

    File.stubs(:read).returns(serialization.to_json)

    new_exp_id = ProgrammingExpression.seed_record("config/programming_expressions/#{programming_environment.name}/file.json")
    new_exp = ProgrammingExpression.find(new_exp_id)
    assert_equal previous_exp.attributes.except('id', 'created_at', 'updated_at'), new_exp.attributes.except('id', 'created_at', 'updated_at')
    assert_equal category, new_exp.programming_environment_category
  end

  test "seed_all adds, updates, and removes programming expressions" do
    programming_environment = create :programming_environment
    category = create :programming_environment_category, programming_environment: programming_environment, name: 'World', color: '#ABCDEF'
    create :programming_expression, key: 'to_delete', programming_environment: programming_environment, programming_environment_category: category
    to_update = create :programming_expression, key: 'to_update', name: 'Old Name', programming_environment: programming_environment, programming_environment_category: category
    to_create = build :programming_expression, key: 'to_create', programming_environment: programming_environment, programming_environment_category: category

    Dir.stubs(:glob).returns(["#{programming_environment.name}/#{to_update.key}.json", "#{programming_environment.name}/#{to_create.key}.json"])

    to_update.name = "Updated name"
    File.stubs(:read).with("#{programming_environment.name}/#{to_update.key}.json").returns(to_update.serialize.to_json)
    File.stubs(:read).with("#{programming_environment.name}/#{to_create.key}.json").returns(to_create.serialize.to_json)
    File.stubs(:delete)

    to_create.destroy!
    to_update.reload
    assert_equal 'Old Name', to_update.name

    ProgrammingExpression.seed_all

    to_update.reload
    refute_nil to_update
    assert_equal 'Updated name', to_update.name
    assert_equal 1, ProgrammingExpression.where(programming_environment_id: programming_environment.id, key: 'to_update').count

    assert_equal 0, ProgrammingExpression.where(programming_environment_id: programming_environment.id, key: 'to_delete').count

    assert_equal 1, ProgrammingExpression.where(programming_environment_id: programming_environment.id, key: 'to_create').count
  end

  test 'can clone expression to another programming environment' do
    original_env = create :programming_environment
    original_cat = create :programming_environment_category, programming_environment: original_env, name: 'World'
    original_exp = create :programming_expression, programming_environment: original_env, programming_environment_category: original_cat, content: 'some well written content', tips: 'a long list of tips'
    new_env = create :programming_environment
    new_cat = create :programming_environment_category, programming_environment: new_env, name: 'World'

    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.stubs(:write).once
    copied_exp = original_exp.clone_to_programming_environment(new_env.name)

    assert_equal new_env.name, copied_exp.programming_environment.name
    assert_equal new_cat.key, copied_exp.programming_environment_category.key
    assert_equal original_exp.content, copied_exp.content
    assert_equal original_exp.tips, copied_exp.tips
  end

  test 'can clone expression to another programming environment and specify category' do
    original_env = create :programming_environment
    original_cat = create :programming_environment_category, programming_environment: original_env, name: 'World'
    original_exp = create :programming_expression, programming_environment: original_env, programming_environment_category: original_cat, content: 'some well written content', tips: 'a long list of tips'
    new_env = create :programming_environment
    create :programming_environment_category, programming_environment: new_env, name: 'World'
    new_cat = create :programming_environment_category, programming_environment: new_env, name: 'Sprites'

    Rails.application.config.stubs(:levelbuilder_mode).returns true
    File.stubs(:write).once
    copied_exp = original_exp.clone_to_programming_environment(new_env.name, new_cat.key)

    assert_equal new_env.name, copied_exp.programming_environment.name
    assert_equal new_cat.key, copied_exp.programming_environment_category.key
    assert_equal original_exp.content, copied_exp.content
    assert_equal original_exp.tips, copied_exp.tips
  end
end

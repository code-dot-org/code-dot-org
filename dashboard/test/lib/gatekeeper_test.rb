require 'test_helper'
require 'dynamic_config/gatekeeper'

class GatekeeperTest < ActiveSupport::TestCase
  test 'returns false if feature is not defined and no default provided' do
    assert_equal Gatekeeper.allows("MADE UP FEATURE NAME"), false
  end

  test 'returns default value if one is supplied' do
    assert_equal Gatekeeper.allows("MADE UP FEATURE NAME", default: true), true
  end

  test "allows with no where clause" do
    feature = "test_feature"

    Gatekeeper.set(feature, value: true)
    assert_equal Gatekeeper.allows(feature), true
  end

  test "order of where conditions doesn't matter" do
    feature = "order test"
    Gatekeeper.set(feature, where: {a: 2, b: 1}, value: true)
    assert_equal Gatekeeper.allows(feature, where: {b: 1, a: 2}, default: false), true
  end

  test "feature key matches when there is no where match" do
    feature = "test_feature2"
    Gatekeeper.set(feature, value: true)

    assert_equal Gatekeeper.allows(feature, where: {user_id: 4}), true
  end

  test "when feature and key match return the result of the where" do
    feature = "test_feature3"
    Gatekeeper.set(feature, value: true)
    Gatekeeper.set(feature, where: {user_id: 4}, value: false)

    assert_equal Gatekeeper.allows(feature, where: {user_id: 4}), false
  end

  test 'deleting a where clause' do
    feature = "test_feature4"
    Gatekeeper.set(feature, where: {user_id: 4}, value: true)
    assert_equal Gatekeeper.allows(feature, where: {user_id: 4}), true

    Gatekeeper.delete(feature, where: {user_id: 4})
    assert_equal Gatekeeper.allows(feature, where: {user_id: 4}), false
  end

  test 'deleting a global clause' do
    feature = "test_feature5"
    Gatekeeper.set(feature, value: true)
    assert_equal Gatekeeper.allows(feature), true

    Gatekeeper.delete(feature)
    assert_equal Gatekeeper.allows(feature, where: {user_id: 4}), false
  end

  test 'get script and feature names' do
    Gatekeeper.set('postMilestone', where: {script_name: 'frozen'}, value: false)
    Gatekeeper.set('postMilestone', where: {script_name: 'mc'}, value: true)
    Gatekeeper.set('postMilestone', value: true)
    Gatekeeper.set('hint_view_request', value: false)
    Gatekeeper.set('shareEnabled', where: {script_name: 'gumball', color: 'red'}, value: true)
    Gatekeeper.set('shareEnabled', where: {script_name: 'mc'}, value: true)

    assert_equal Set.new(['hint_view_request', 'postMilestone', 'shareEnabled']), Gatekeeper.feature_names
    assert_equal Set.new(['frozen', 'gumball', 'mc']), Gatekeeper.script_names

    # Make sure that a deleted feature no longer shows up in the list of feature names.
    Gatekeeper.delete('hint_view_request')
    assert_equal Set.new(['postMilestone', 'shareEnabled']), Gatekeeper.feature_names
  end

  # A datastore row can round-trip to nil rules (the DynamoDB adapter maps an
  # unparseable value to nil). to_hash and property_values must skip it the way
  # feature_names does, rather than raising NoMethodError and taking down the
  # whole gatekeeper admin page.
  test 'to_hash skips a feature whose rules are nil instead of raising' do
    datastore_cache = Gatekeeper.instance_variable_get(:@datastore_cache)
    datastore_cache.stubs(:all).returns(
      'corrupt_feature' => nil,
      'shareEnabled' => {Oj.dump([], mode: :strict) => true}
    )

    result = Gatekeeper.to_hash

    refute result.key?('corrupt_feature')
    assert_equal({'shareEnabled' => [{'rule' => nil, 'value' => true}]}, result)
  end

  test 'property_values skips a feature whose rules are nil instead of raising' do
    datastore_cache = Gatekeeper.instance_variable_get(:@datastore_cache)
    datastore_cache.stubs(:all).returns(
      'corrupt_feature' => nil,
      'shareEnabled' => {Oj.dump([['script_name', 'mc']], mode: :strict) => true}
    )

    assert_equal Set.new(['mc']), Gatekeeper.script_names
  end

  test 'disallows' do
    feature_disallowed = 'test feature 1'
    feature_allowed = 'test feature 2'
    Gatekeeper.expects(:allows).with(feature_disallowed).returns(false)
    Gatekeeper.expects(:allows).with(feature_allowed).returns(true)

    assert Gatekeeper.disallows(feature_disallowed)
    refute Gatekeeper.disallows(feature_allowed)
  end
end

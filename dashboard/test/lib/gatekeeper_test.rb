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
    Gatekeeper.set(feature, where: { a: 2, b: 1 }, value: true)
    assert_equal Gatekeeper.allows(feature, where: {b: 1, a: 2}, default: false), true
  end

  test "feature key matches when there is no where match" do
    feature = "test_feature2"
    Gatekeeper.set(feature, value: true)

    assert_equal Gatekeeper.allows(feature, where: { user_id: 4 }), true
  end

  test "when feature and key match return the result of the where" do
    feature = "test_feature3"
    Gatekeeper.set(feature, value: true)
    Gatekeeper.set(feature, where: { user_id: 4 }, value: false)

    assert_equal Gatekeeper.allows(feature, where: { user_id: 4 }), false
  end

  test 'deleting a where clause' do
    feature = "test_feature4"
    Gatekeeper.set(feature, where: { user_id: 4 }, value: true)
    assert_equal Gatekeeper.allows(feature, where: { user_id: 4 }), true

    Gatekeeper.delete(feature, where: {user_id: 4})
    assert_equal Gatekeeper.allows(feature, where: { user_id: 4 }), false
  end

  test 'deleting a global clause' do
    feature = "test_feature5"
    Gatekeeper.set(feature, value: true)
    assert_equal Gatekeeper.allows(feature), true

    Gatekeeper.delete(feature)
    assert_equal Gatekeeper.allows(feature, where: { user_id: 4 }), false

  end

  test 'get script and feature names' do
    Gatekeeper.set('postMilestone', where: {script_name: 'frozen'}, value: false)
    Gatekeeper.set('postMilestone', where: {script_name: 'mc'}, value: true)
    Gatekeeper.set('postMilestone', value: true)
    Gatekeeper.set('hint_view_request', value: false)
    Gatekeeper.set('shareEnabled', where: {script_name: 'gumball', color: 'red'}, value: true)
    Gatekeeper.set('shareEnabled', where: {script_name: 'mc'}, value: true)

    assert_equal Set.new(%w(hint_view_request postMilestone shareEnabled)), Gatekeeper.feature_names
    assert_equal Set.new(%w(frozen gumball mc)), Gatekeeper.script_names

    # Make sure that a deleted feature no longer shows up in the list of feature names.
    Gatekeeper.delete('hint_view_request')
    assert_equal Set.new(%w(postMilestone shareEnabled)), Gatekeeper.feature_names
  end

end

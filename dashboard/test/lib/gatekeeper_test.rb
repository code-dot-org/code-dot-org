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

end

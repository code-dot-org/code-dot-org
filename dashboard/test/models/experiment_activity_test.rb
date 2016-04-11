require 'test_helper'

class ExperimentActivityTest < ActiveSupport::TestCase
  test "pick_mod_length" do
    my_list = [:a, :b, :c]
    assert_equal :a, ExperimentActivity.pick_mod_length(my_list, 0)
    assert_equal :a, ExperimentActivity.pick_mod_length(my_list, 30)
    assert_equal :b, ExperimentActivity.pick_mod_length(my_list, 1)
    assert_equal :b, ExperimentActivity.pick_mod_length(my_list, 4)
    assert_equal :c, ExperimentActivity.pick_mod_length(my_list, 2)
    assert_equal :c, ExperimentActivity.pick_mod_length(my_list, 302)
  end

  test "try_get_int_parameter with bad url" do
    assert_nil ExperimentActivity.try_get_int_parameter(nil, 'foo')
  end

  test "try_get_int_parameter with good url with ints" do
    url = "http://foo.com?a=3&b=4"
    assert_equal 3, ExperimentActivity.try_get_int_parameter(url, 'a')
    assert_equal 4, ExperimentActivity.try_get_int_parameter(url, 'b')
    assert_nil ExperimentActivity.try_get_int_parameter(url, 'c')
  end

  test "try_get_int_parameter with good url with strings" do
    url = "http://foo.com?a=foo&b=bar"
    assert_equal nil, ExperimentActivity.try_get_int_parameter(url, 'a')
    assert_equal nil, ExperimentActivity.try_get_int_parameter(url, 'b')
  end

  # For non-empty arrays, this always returns a positive numeric value n,
  # such that pick_mod_length(array, n) == value, unless the
  # value is not in the array, in which case it returns false.
  def inverse_pick_mod_length(array, value)
    array.include?(value) && array.index(value) + array.length
  end

  # Create a URI that specifies a hash that yields the given value.
  def feedback_experiment_uri(value)
    "http://learn.code.org?#{ExperimentActivity::FEEDBACK_EXPERIMENT_PARAMETER}=" +
        "#{inverse_pick_mod_length(\
            ExperimentActivity::FEEDBACK_EXPERIMENT_SOURCES, value)}"
  end

  test "try to run Stanford feedback experiment with no level_source" do
    response = ExperimentActivity.determine_hint(
        enable_external_hints: true,
        uri: feedback_experiment_uri(LevelSourceHint::STANFORD))
    assert_nil response[:hint]
    assert_nil response[:hint_request_placement]
    assert_equal 0, ActivityHint.count
  end

# TODO: (Laurel) Disabled until random test failures are resolved
#   test "try to run Stanford feedback experiment with no hints" do
#      response = ExperimentActivity::determine_hint(
#        enable_external_hints: true,
#        level_source: (create :level_source),
#        uri: feedback_experiment_uri(LevelSourceHint::STANFORD))
#      assert_nil response[:hint]
#      assert_nil response[:hint_request_placement]
#      assert_equal 0, ActivityHint.count
#   end

  def setup_hints
    @level_source = create :level_source
    @crowdsourced_hint = 'crowdsourced hints'
    LevelSourceHint.create!(level_source_id: @level_source.id,
                            hint: @crowdsourced_hint,
                            status: LevelSourceHint::STATUS_SELECTED,
                            source: LevelSourceHint::CROWDSOURCED)
    @stanford_hint = 'Stanford hint'
    LevelSourceHint.create!(level_source_id: @level_source.id,
                            hint: @stanford_hint,
                            status: LevelSourceHint::STATUS_SELECTED,
                            source: LevelSourceHint::STANFORD)
    @activity = create :activity
  end

  test "try to get Stanford hint by url" do
    setup_hints
    response = ExperimentActivity.determine_hint(
        level_source: @level_source,
        activity: @activity,
        uri: feedback_experiment_uri(LevelSourceHint::STANFORD))
    assert_equal @stanford_hint, response[:hint]
    activity_hint = response[:activity_hint]
    assert_not_nil activity_hint
    assert_equal @activity.id, activity_hint.activity_id
    assert_equal @stanford_hint, LevelSourceHint.find(activity_hint.level_source_hint_id).hint
    assert_nil activity_hint.hint_visibility
    assert activity_hint.ip_hash > 0
  end

  test "try to get crowdsourced hint by url" do
    setup_hints
    response = ExperimentActivity.determine_hint(
        level_source: @level_source,
        activity: @activity,
        uri: feedback_experiment_uri(LevelSourceHint::CROWDSOURCED))
    assert_equal @crowdsourced_hint, response[:hint]
    activity_hint = response[:activity_hint]
    assert_not_nil activity_hint
    assert_equal @activity.id, activity_hint.activity_id
    assert_equal @crowdsourced_hint, LevelSourceHint.find(activity_hint.level_source_hint_id).hint
    assert_nil activity_hint.hint_visibility
    assert activity_hint.ip_hash > 0
  end

  test "try to get nil hint" do
    setup_hints
    response = ExperimentActivity.determine_hint(
        level_source: @level_source,
        activity: @activity,
        uri: feedback_experiment_uri(nil))
    assert_nil response[:hint]
    activity_hint = response[:activity_hint]
    assert_not_nil activity_hint
    assert_equal @activity.id, activity_hint.activity_id
    assert_nil activity_hint.level_source_hint_id
    assert_nil activity_hint.hint_visibility
    assert activity_hint.ip_hash > 0
  end

  test "try to hash invalid ip address" do
    bad_values = [nil, 'grumble', 'foo.bar', 'foo.bar.baz.zoo', '1.2.3.4.5', '1.2..']
    bad_values.each { |ip|
      assert_equal nil, ExperimentActivity.ip_to_hash_value(ip),
                   "Did not get expected value of 0 for argument \"#{ip}\"."
    }
  end

  test "try to hash valid ip address" do
    assert_equal 3, ExperimentActivity.ip_to_hash_value('1.2.3.4')
    assert_equal 0, ExperimentActivity.ip_to_hash_value('127.0.0.1')
  end
end

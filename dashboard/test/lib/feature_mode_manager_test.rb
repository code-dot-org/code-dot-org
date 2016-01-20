require 'test_helper'
require 'cdo/script_config'
require 'feature_mode_manager'

class FeatureModeManagerTest < ActiveSupport::TestCase
  def setup
    @gatekeeper = GatekeeperBase.create
    @dcdo = DCDOBase.create
  end

  # Verify that after setting each of the possible modes that the
  # feature mode manager knows we are in that mode.
  def test_round_trip_feature_modes
    scripts = ['fake1', 'fake2']
    %w{normal scale emergency}.each do |mode|
      FeatureModeManager.set_mode(mode, @gatekeeper, @dcdo, scripts)
      assert_equal mode, FeatureModeManager.get_mode(@gatekeeper, @dcdo, scripts)
    end
  end

  def test_get_mode_returns_nil_if_dcdo_property_does_not_match
    scripts = ['fake1', 'fake2']
    FeatureModeManager.set_mode('normal', @gatekeeper, @dcdo, scripts)
    @dcdo.set('hoc_activity_sample_weight', 2)
    assert_equal nil, FeatureModeManager.get_mode(@gatekeeper, @dcdo, scripts)
    # Set the DCDO property back to the original value and make sure we're in normal mode.
    @dcdo.set('hoc_activity_sample_weight', 1)
    assert_equal 'normal', FeatureModeManager.get_mode(@gatekeeper, @dcdo, scripts)
  end

  def test_get_mode_returns_nil_if_hoc_gatekeeper_property_does_not_match
    scripts = ['fake1', 'fake2']
    FeatureModeManager.set_mode('normal', @gatekeeper, @dcdo, scripts)
    @gatekeeper.set('postMilestone', where: {script_name: 'fake1'}, value: false)
    assert_equal nil, FeatureModeManager.get_mode(@gatekeeper, @dcdo, scripts)
    @gatekeeper.set('postMilestone', where: {script_name: 'fake1'}, value: true)
    assert_equal 'normal', FeatureModeManager.get_mode(@gatekeeper, @dcdo, scripts)
  end

  def test_get_mode_returns_nil_if_general_gatekeeper_property_does_not_match
    scripts = ['fake1', 'fake2']
    FeatureModeManager.set_mode('normal', @gatekeeper, @dcdo, scripts)
    @gatekeeper.set('puzzle_rating', value: false)
    assert_equal nil, FeatureModeManager.get_mode(@gatekeeper, @dcdo, scripts)
    @gatekeeper.set('puzzle_rating', value: true)
    assert_equal 'normal', FeatureModeManager.get_mode(@gatekeeper, @dcdo, scripts)

    @gatekeeper.set('postMilestone', value: false)
    assert_equal nil, FeatureModeManager.get_mode(@gatekeeper, @dcdo, scripts)
    @gatekeeper.set('postMilestone', value: true)
    assert_equal 'normal', FeatureModeManager.get_mode(@gatekeeper, @dcdo, scripts)
  end

  def test_normal_mode
    scripts = ScriptConfig.cached_scripts
    FeatureModeManager.set_mode('normal', @gatekeeper, @dcdo, scripts)
    assert @gatekeeper.allows('puzzle_rating')
    assert @gatekeeper.allows('hint_view_request')
    scripts.each do |script|
      assert @gatekeeper.allows('postMilestone', where: {script_name: script})
      assert @gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    assert @gatekeeper.allows('postMilestone')
    assert @gatekeeper.allows('shareEnabled')
    assert_equal 1, @dcdo.get('hoc_activity_sample_weight', nil).to_i
    assert_equal 180, @dcdo.get('public_proxy_max_age', nil)
    assert_equal 360, @dcdo.get('public_max_age', nil)
  end

  def test_get_feature_names_for_mode
    assert_equal Set.new(['puzzle_rating', 'hint_view_request', 'postMilestone', 'shareEnabled']),
                 FeatureModeManager.get_feature_names_for_mode('normal')
  end

  def test_mode_allows_feature
    assert FeatureModeManager.mode_allows_feature_for_hoc_scripts('normal', 'postMilestone')
    assert FeatureModeManager.mode_allows_feature_by_default('normal', 'puzzle_rating')
    refute FeatureModeManager.mode_allows_feature_for_hoc_scripts('emergency', 'postMilestone')
    refute FeatureModeManager.mode_allows_feature_by_default('emergency', 'puzzle_rating')
  end

  def test_mode_allows_feature_with_unknown_mode
    assert_nil FeatureModeManager.mode_allows_feature_for_hoc_scripts('custom', 'postMilestone')
  end

  def test_mode_allows_feature_with_unknown_feature
    assert_nil FeatureModeManager.mode_allows_feature_for_hoc_scripts('normal', 'unknownFeature')
  end

  def test_mode_or_gatekeeper_allows
    scripts = ScriptConfig.cached_scripts
    FeatureModeManager.set_mode('normal', @gatekeeper, @dcdo, ['script'])

    assert FeatureModeManager.allows(@gatekeeper, 'normal', 'postMilestone', 'script')
    @gatekeeper.set('postMilestone', where: {script_name: 'script'}, value: false)
    assert FeatureModeManager.allows(@gatekeeper, 'normal', 'postMilestone', 'script')

    # Feature mode manager settings should take priority over gatekeeper settings.
    @gatekeeper.set('postMilestone', value: false)
    assert FeatureModeManager.allows(@gatekeeper, 'normal', 'postMilestone', 'script')

    # Features which aren't specified in the feature mode manager should fall back on the Gatekeeper
    # setting.
    refute FeatureModeManager.allows(@gatekeeper, 'normal', 'newFeature', 'script')
    @gatekeeper.set('newFeature', where: {script_name: 'script'}, value: false)
    refute FeatureModeManager.allows(@gatekeeper, 'normal', 'newFeature', 'script')
    @gatekeeper.set('newFeature', where: {script_name: 'script'}, value: true)
    assert FeatureModeManager.allows(@gatekeeper, 'normal', 'newFeature', 'script')

    # Make sure the disabled features work correctly as well.
    FeatureModeManager.set_mode('emergency', @gatekeeper, @dcdo, ['script'])
    refute FeatureModeManager.allows(@gatekeeper, 'emergency', 'postMilestone', 'script')
  end

  def test_scale_mode
    scripts = ScriptConfig.cached_scripts
    FeatureModeManager.set_mode('scale', @gatekeeper, @dcdo, scripts)
    refute @gatekeeper.allows('puzzle_rating')
    refute @gatekeeper.allows('hint_view_request')
    scripts.each do |script|
      refute @gatekeeper.allows('postMilestone', where: {script_name: script})
      assert @gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    assert @gatekeeper.allows('postMilestone')
    assert @gatekeeper.allows('shareEnabled')
    assert_equal 10, @dcdo.get('hoc_activity_sample_weight', nil).to_i
    assert_equal 14400, @dcdo.get('public_proxy_max_age', nil)
    assert_equal 28800, @dcdo.get('public_max_age', nil)
  end

  def test_emergency_mode
    scripts = ScriptConfig.cached_scripts
    FeatureModeManager.set_mode('emergency', @gatekeeper, @dcdo, scripts)
    refute @gatekeeper.allows('puzzle_rating')
    refute @gatekeeper.allows('hint_view_request')
    scripts.each do |script|
      refute @gatekeeper.allows('postMilestone', where: {script_name: script})
      refute @gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    refute @gatekeeper.allows('postMilestone')
    refute @gatekeeper.allows('shareEnabled')
    assert_equal 10, @dcdo.get('hoc_activity_sample_weight', nil).to_i
    assert_equal 86400, @dcdo.get('public_proxy_max_age', nil)
    assert_equal 172800, @dcdo.get('public_max_age', nil)
  end

  def test_raises_on_invalid_mode
    assert_raises RuntimeError do
      FeatureModeManager.set_mode('invalid', @gatekeeper, @dcdo, ['fake'])
    end
  end

end

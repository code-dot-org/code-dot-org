require 'test_helper'
require 'cdo/script_config'
require 'feature_mode_manager'

class FeatureModeManagerTest < ActiveSupport::TestCase
  HOC_UNITS = ScriptConfig.hoc_scripts
  CSF_UNITS = ScriptConfig.csf_scripts
  HOC_AND_CSF_UNITS = HOC_UNITS + CSF_UNITS

  # representative individual HOC script name
  HOC_UNIT = 'starwars'

  def setup
    CDO.stubs(hip_chat_logging: false)
    CDO.stubs(slack_endpoint: nil)
    CDO.stubs(:shared_cache).returns(ActiveSupport::Cache::MemoryStore.new)
  end

  # Verify that after setting each of the possible modes that the
  # feature mode manager knows we are in that mode.
  def test_round_trip_feature_modes
    %w{normal scale emergency}.each do |mode|
      FeatureModeManager.set_mode(mode, Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
      assert_equal mode, FeatureModeManager.get_mode(Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    end
  end

  def test_get_mode_returns_nil_if_dcdo_property_does_not_match
    FeatureModeManager.set_mode('normal', Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    DCDO.set('hoc_activity_sample_weight', 2)
    assert_nil FeatureModeManager.get_mode(Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    # Set the DCDO property back to the original value and make sure we're in normal mode.
    DCDO.set('hoc_activity_sample_weight', 1)
    assert_equal 'normal', FeatureModeManager.get_mode(Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
  end

  def test_get_mode_returns_nil_if_hoc_gatekeeper_property_does_not_match
    FeatureModeManager.set_mode('normal', Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    Gatekeeper.set('postMilestone', where: {script_name: HOC_UNIT}, value: false)
    assert_nil FeatureModeManager.get_mode(Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    Gatekeeper.set('postMilestone', where: {script_name: HOC_UNIT}, value: true)
    assert_equal 'normal', FeatureModeManager.get_mode(Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
  end

  def test_get_mode_returns_nil_if_general_gatekeeper_property_does_not_match
    FeatureModeManager.set_mode('normal', Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    Gatekeeper.set('puzzle_rating', value: false)
    assert_nil FeatureModeManager.get_mode(Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    Gatekeeper.set('puzzle_rating', value: true)
    assert_equal 'normal', FeatureModeManager.get_mode(Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)

    Gatekeeper.set('postMilestone', value: false)
    assert_nil FeatureModeManager.get_mode(Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    Gatekeeper.set('postMilestone', value: true)
    assert_equal 'normal', FeatureModeManager.get_mode(Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
  end

  def test_normal_mode
    FeatureModeManager.set_mode('normal', Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    assert Gatekeeper.allows('puzzle_rating')
    assert Gatekeeper.allows('hint_view_request')
    HOC_AND_CSF_UNITS.each do |script|
      assert Gatekeeper.allows('postMilestone', where: {script_name: script})
      assert Gatekeeper.allows('postFailedRunMilestone', where: {script_name: script})
      assert Gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    assert Gatekeeper.allows('postMilestone')
    assert Gatekeeper.allows('postFailedRunMilestone')
    assert Gatekeeper.allows('shareEnabled')
    assert Gatekeeper.allows('slogging')
    assert_equal 1, DCDO.get('hoc_activity_sample_weight', nil).to_i
    assert_equal 180, DCDO.get('public_proxy_max_age', nil)
    assert_equal 360, DCDO.get('public_max_age', nil)
  end

  def test_allows
    FeatureModeManager.set_mode('normal', Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)

    assert FeatureModeManager.allows(Gatekeeper, 'normal', 'postMilestone', HOC_UNIT)
    assert FeatureModeManager.allows(Gatekeeper, 'normal', 'postMilestone', nil)
    assert FeatureModeManager.allows(Gatekeeper, 'normal', 'hint_view_request', HOC_UNIT)
    assert FeatureModeManager.allows(Gatekeeper, 'normal', 'hint_view_request', nil)
    assert FeatureModeManager.allows(Gatekeeper, 'scale', 'postMilestone', nil)
    assert FeatureModeManager.allows(Gatekeeper, 'scale', 'postMilestone', HOC_UNIT)
    assert FeatureModeManager.allows(Gatekeeper, 'scale', 'hint_view_request', HOC_UNIT)
    assert FeatureModeManager.allows(Gatekeeper, 'scale', 'hint_view_request', nil)
    refute FeatureModeManager.allows(Gatekeeper, 'emergency', 'postMilestone', HOC_UNIT)
    assert FeatureModeManager.allows(Gatekeeper, 'emergency', 'postMilestone', nil)
    refute FeatureModeManager.allows(Gatekeeper, 'emergency', 'hint_view_request', HOC_UNIT)
    refute FeatureModeManager.allows(Gatekeeper, 'emergency', 'hint_view_request', nil)

    # Feature mode manager settings should take priority over gatekeeper settings.
    Gatekeeper.set('postMilestone', value: false)
    assert FeatureModeManager.allows(Gatekeeper, 'normal', 'postMilestone', HOC_UNIT)

    # Features which aren't specified in the feature mode manager should fall back on the Gatekeeper
    # setting.
    refute FeatureModeManager.allows(Gatekeeper, 'normal', 'newFeature', HOC_UNIT)
    Gatekeeper.set('newFeature', where: {script_name: 'script1'}, value: false)
    refute FeatureModeManager.allows(Gatekeeper, 'normal', 'newFeature', 'script1')
    Gatekeeper.set('newFeature', where: {script_name: 'script1'}, value: true)
    assert FeatureModeManager.allows(Gatekeeper, 'normal', 'newFeature', 'script1')

    # Make sure the disabled features work correctly as well.
    FeatureModeManager.set_mode('emergency', Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    refute FeatureModeManager.allows(Gatekeeper, 'emergency', 'postMilestone', HOC_UNIT)
  end

  def test_scale_mode
    FeatureModeManager.set_mode('scale', Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    assert Gatekeeper.allows('puzzle_rating')
    assert Gatekeeper.allows('hint_view_request')
    HOC_AND_CSF_UNITS.each do |script|
      assert Gatekeeper.allows('postMilestone', where: {script_name: script})
      assert Gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    assert Gatekeeper.allows('postMilestone')
    assert Gatekeeper.allows('postFailedRunMilestone')
    assert Gatekeeper.allows('shareEnabled')
    refute Gatekeeper.allows('slogging')
    assert_equal 1, DCDO.get('hoc_activity_sample_weight', nil).to_i
    assert_equal 14400, DCDO.get('public_proxy_max_age', nil)
    assert_equal 28800, DCDO.get('public_max_age', nil)
  end

  def test_fallback_mode
    FeatureModeManager.set_mode('fallback', Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    refute Gatekeeper.allows('puzzle_rating')
    assert Gatekeeper.allows('hint_view_request')
    HOC_UNITS.each do |script|
      assert Gatekeeper.allows('postMilestone', where: {script_name: script})
      refute Gatekeeper.allows('postFailedRunMilestone', where: {script_name: script})
      assert Gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    CSF_UNITS.each do |script|
      assert Gatekeeper.allows('postMilestone', where: {script_name: script})
      assert Gatekeeper.allows('postFailedRunMilestone', where: {script_name: script})
      assert Gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    assert Gatekeeper.allows('postMilestone')
    assert Gatekeeper.allows('postFailedRunMilestone')
    assert Gatekeeper.allows('shareEnabled')
    refute Gatekeeper.allows('slogging')
    assert_equal 1, DCDO.get('hoc_activity_sample_weight', nil).to_i
    assert_equal 14400, DCDO.get('public_proxy_max_age', nil)
    assert_equal 28800, DCDO.get('public_max_age', nil)
  end

  def test_emergency_mode
    hoc_scripts = ScriptConfig.hoc_scripts
    csf_scripts = ScriptConfig.csf_scripts
    FeatureModeManager.set_mode('emergency', Gatekeeper, DCDO, hoc_scripts, csf_scripts)
    refute Gatekeeper.allows('puzzle_rating')
    refute Gatekeeper.allows('hint_view_request')
    HOC_AND_CSF_UNITS.each do |script|
      refute Gatekeeper.allows('postMilestone', where: {script_name: script})
      assert Gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    assert Gatekeeper.allows('postMilestone')
    assert Gatekeeper.allows('shareEnabled')
    refute Gatekeeper.allows('slogging')
    assert_equal 10, DCDO.get('hoc_activity_sample_weight', nil).to_i
    assert_equal 86400, DCDO.get('public_proxy_max_age', nil)
    assert_equal 172800, DCDO.get('public_max_age', nil)
  end

  def test_raises_on_invalid_mode
    assert_raises RuntimeError do
      FeatureModeManager.set_mode('invalid', Gatekeeper, DCDO, HOC_UNITS, CSF_UNITS)
    end
  end
end

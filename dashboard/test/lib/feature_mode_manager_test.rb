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
    @gatekeeper = GatekeeperBase.create
    @dcdo = DCDOBase.create
  end

  # Verify that after setting each of the possible modes that the
  # feature mode manager knows we are in that mode.
  def test_round_trip_feature_modes
    %w{normal scale emergency}.each do |mode|
      FeatureModeManager.set_mode(mode, @gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
      assert_equal mode, FeatureModeManager.get_mode(@gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    end
  end

  def test_get_mode_returns_nil_if_dcdo_property_does_not_match
    FeatureModeManager.set_mode('normal', @gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    @dcdo.set('hoc_activity_sample_weight', 2)
    assert_nil FeatureModeManager.get_mode(@gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    # Set the DCDO property back to the original value and make sure we're in normal mode.
    @dcdo.set('hoc_activity_sample_weight', 1)
    assert_equal 'normal', FeatureModeManager.get_mode(@gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
  end

  def test_get_mode_returns_nil_if_hoc_gatekeeper_property_does_not_match
    FeatureModeManager.set_mode('normal', @gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    @gatekeeper.set('postMilestone', where: {script_name: HOC_UNIT}, value: false)
    assert_nil FeatureModeManager.get_mode(@gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    @gatekeeper.set('postMilestone', where: {script_name: HOC_UNIT}, value: true)
    assert_equal 'normal', FeatureModeManager.get_mode(@gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
  end

  def test_get_mode_returns_nil_if_general_gatekeeper_property_does_not_match
    FeatureModeManager.set_mode('normal', @gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    @gatekeeper.set('puzzle_rating', value: false)
    assert_nil FeatureModeManager.get_mode(@gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    @gatekeeper.set('puzzle_rating', value: true)
    assert_equal 'normal', FeatureModeManager.get_mode(@gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)

    @gatekeeper.set('postMilestone', value: false)
    assert_nil FeatureModeManager.get_mode(@gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    @gatekeeper.set('postMilestone', value: true)
    assert_equal 'normal', FeatureModeManager.get_mode(@gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
  end

  def test_normal_mode
    FeatureModeManager.set_mode('normal', @gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    assert @gatekeeper.allows('puzzle_rating')
    assert @gatekeeper.allows('hint_view_request')
    HOC_AND_CSF_UNITS.each do |script|
      assert @gatekeeper.allows('postMilestone', where: {script_name: script})
      assert @gatekeeper.allows('postFailedRunMilestone', where: {script_name: script})
      assert @gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    assert @gatekeeper.allows('postMilestone')
    assert @gatekeeper.allows('postFailedRunMilestone')
    assert @gatekeeper.allows('shareEnabled')
    assert @gatekeeper.allows('slogging')
    assert_equal 1, @dcdo.get('hoc_activity_sample_weight', nil).to_i
    assert_equal 180, @dcdo.get('public_proxy_max_age', nil)
    assert_equal 360, @dcdo.get('public_max_age', nil)
  end

  def test_allows
    FeatureModeManager.set_mode('normal', @gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)

    assert FeatureModeManager.allows(@gatekeeper, 'normal', 'postMilestone', HOC_UNIT)
    assert FeatureModeManager.allows(@gatekeeper, 'normal', 'postMilestone', nil)
    assert FeatureModeManager.allows(@gatekeeper, 'normal', 'hint_view_request', HOC_UNIT)
    assert FeatureModeManager.allows(@gatekeeper, 'normal', 'hint_view_request', nil)
    assert FeatureModeManager.allows(@gatekeeper, 'scale', 'postMilestone', nil)
    assert FeatureModeManager.allows(@gatekeeper, 'scale', 'postMilestone', HOC_UNIT)
    assert FeatureModeManager.allows(@gatekeeper, 'scale', 'hint_view_request', HOC_UNIT)
    assert FeatureModeManager.allows(@gatekeeper, 'scale', 'hint_view_request', nil)
    refute FeatureModeManager.allows(@gatekeeper, 'emergency', 'postMilestone', HOC_UNIT)
    assert FeatureModeManager.allows(@gatekeeper, 'emergency', 'postMilestone', nil)
    refute FeatureModeManager.allows(@gatekeeper, 'emergency', 'hint_view_request', HOC_UNIT)
    refute FeatureModeManager.allows(@gatekeeper, 'emergency', 'hint_view_request', nil)

    # Feature mode manager settings should take priority over gatekeeper settings.
    @gatekeeper.set('postMilestone', value: false)
    assert FeatureModeManager.allows(@gatekeeper, 'normal', 'postMilestone', HOC_UNIT)

    # Features which aren't specified in the feature mode manager should fall back on the Gatekeeper
    # setting.
    refute FeatureModeManager.allows(@gatekeeper, 'normal', 'newFeature', HOC_UNIT)
    @gatekeeper.set('newFeature', where: {script_name: 'script1'}, value: false)
    refute FeatureModeManager.allows(@gatekeeper, 'normal', 'newFeature', 'script1')
    @gatekeeper.set('newFeature', where: {script_name: 'script1'}, value: true)
    assert FeatureModeManager.allows(@gatekeeper, 'normal', 'newFeature', 'script1')

    # Make sure the disabled features work correctly as well.
    FeatureModeManager.set_mode('emergency', @gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    refute FeatureModeManager.allows(@gatekeeper, 'emergency', 'postMilestone', HOC_UNIT)
  end

  def test_scale_mode
    FeatureModeManager.set_mode('scale', @gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    assert @gatekeeper.allows('puzzle_rating')
    assert @gatekeeper.allows('hint_view_request')
    HOC_AND_CSF_UNITS.each do |script|
      assert @gatekeeper.allows('postMilestone', where: {script_name: script})
      assert @gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    assert @gatekeeper.allows('postMilestone')
    assert @gatekeeper.allows('postFailedRunMilestone')
    assert @gatekeeper.allows('shareEnabled')
    refute @gatekeeper.allows('slogging')
    assert_equal 1, @dcdo.get('hoc_activity_sample_weight', nil).to_i
    assert_equal 14400, @dcdo.get('public_proxy_max_age', nil)
    assert_equal 28800, @dcdo.get('public_max_age', nil)
  end

  def test_fallback_mode
    FeatureModeManager.set_mode('fallback', @gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    refute @gatekeeper.allows('puzzle_rating')
    assert @gatekeeper.allows('hint_view_request')
    HOC_UNITS.each do |script|
      assert @gatekeeper.allows('postMilestone', where: {script_name: script})
      refute @gatekeeper.allows('postFailedRunMilestone', where: {script_name: script})
      assert @gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    CSF_UNITS.each do |script|
      assert @gatekeeper.allows('postMilestone', where: {script_name: script})
      assert @gatekeeper.allows('postFailedRunMilestone', where: {script_name: script})
      assert @gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    assert @gatekeeper.allows('postMilestone')
    assert @gatekeeper.allows('postFailedRunMilestone')
    assert @gatekeeper.allows('shareEnabled')
    refute @gatekeeper.allows('slogging')
    assert_equal 1, @dcdo.get('hoc_activity_sample_weight', nil).to_i
    assert_equal 14400, @dcdo.get('public_proxy_max_age', nil)
    assert_equal 28800, @dcdo.get('public_max_age', nil)
  end

  def test_emergency_mode
    hoc_scripts = ScriptConfig.hoc_scripts
    csf_scripts = ScriptConfig.csf_scripts
    FeatureModeManager.set_mode('emergency', @gatekeeper, @dcdo, hoc_scripts, csf_scripts)
    refute @gatekeeper.allows('puzzle_rating')
    refute @gatekeeper.allows('hint_view_request')
    HOC_AND_CSF_UNITS.each do |script|
      refute @gatekeeper.allows('postMilestone', where: {script_name: script})
      assert @gatekeeper.allows('shareEnabled', where: {script_name: script})
    end
    assert @gatekeeper.allows('postMilestone')
    assert @gatekeeper.allows('shareEnabled')
    refute @gatekeeper.allows('slogging')
    assert_equal 10, @dcdo.get('hoc_activity_sample_weight', nil).to_i
    assert_equal 86400, @dcdo.get('public_proxy_max_age', nil)
    assert_equal 172800, @dcdo.get('public_max_age', nil)
  end

  def test_raises_on_invalid_mode
    assert_raises RuntimeError do
      FeatureModeManager.set_mode('invalid', @gatekeeper, @dcdo, HOC_UNITS, CSF_UNITS)
    end
  end
end

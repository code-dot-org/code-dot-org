require 'test_helper'

class CalloutTest < ActiveSupport::TestCase
  include ActiveSupport::Testing::Stream

  self.use_transactional_test_case = true
  setup_all do
    @level = create(:level, :blockly, level_num: 'level1_2_3')
    @unit = create(:script, id: 10333)
    @script2 = create(:script, id: 10321)
    @script_level = create(:script_level, script: @script, levels: [@level])
    @script_level2 = create(:script_level, script: @script2, levels: [@level])
    @csv_callouts = Callout.find_or_create_all_from_tsv!('test/fixtures/callouts.tsv')
  end

  test "callouts should be generated from a tsv" do
    assert_equal(2, @csv_callouts.length)
  end

  test "callouts should have proper attributes after import" do
    assert_equal('#runButton', @csv_callouts.first.element_id)
    assert_equal('run', @csv_callouts.first.localization_key)
    assert_nil(@csv_callouts.first.qtip_config)
    assert_equal(@csv_callouts.last.qtip_config, '{"position": {"my": "bottom left", "at": "top right", "adjust": {"x": 297, "y":70}}}')
  end

  test "callouts should first_or_create when imported from tsv" do
    callouts_second_time = Callout.find_or_create_all_from_tsv!('test/fixtures/callouts.tsv')
    assert_equal(@csv_callouts.first.id, callouts_second_time.first.id)
    assert_equal(@csv_callouts.last.id, callouts_second_time.last.id)
  end

  test "callouts should have a script level" do
    script_level = create(:script_level)
    callout = create(:callout, script_level: script_level)
    assert_equal(script_level, callout.script_level)
  end

  test "callouts should import finding their script levels based on script.id and level_num" do
    assert_equal(@script_level, @csv_callouts.first.script_level)
    assert_equal(@script_level2, @csv_callouts.last.script_level)
  end

  test "callout lines with an invalid script / level pair should fail silently" do
    content = capture(:stdout) do
      @invalid_callout_import = Callout.find_or_create_all_from_tsv!('test/fixtures/callouts_invalid.tsv')
      assert_nil(@invalid_callout_import[0])
    end
    assert(content.include?("Error finding script level "))
  end
end

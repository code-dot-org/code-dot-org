require 'test_helper'

class AdaptiveTest < ActiveSupport::TestCase
  setup do
    @dir = Pathname.new(Dir.mktmpdir)
    @dir.join('sample.json').write({'id' => 'sample', 'title' => 'Sample'}.to_json)
    AdaptiveContent.stubs(:content_dir).returns(@dir)
    AdaptiveContent.reset_cache!
  end

  teardown do
    AdaptiveContent.reset_cache!
    FileUtils.remove_entry(@dir)
  end

  test "uses_lab2? is true" do
    assert create(:adaptive).uses_lab2?
  end

  test "requires a content id whose file exists" do
    refute build(:adaptive, adaptive_id: nil).valid?
    refute build(:adaptive, adaptive_id: 'missing').valid?
    refute build(:adaptive, adaptive_id: '../sample').valid?
    assert build(:adaptive, adaptive_id: 'sample').valid?
  end

  test "lab2 properties include the parsed content" do
    level = create(:adaptive)
    script_level = create(:script_level, levels: [level])

    properties = level.summarize_for_lab2_properties(script_level.script, script_level, create(:student))

    assert_equal 'adaptive', properties[:appName]
    assert_equal 'sample', properties['adaptiveId']
    assert_equal 'Sample', properties[:adaptiveContent]['title']
  end

  test "lab2 properties carry no user-specific keys" do
    level = create(:adaptive)
    script_level = create(:script_level, levels: [level])

    properties = level.summarize_for_lab2_properties(script_level.script, script_level, create(:student))

    assert_empty properties.keys.map(&:to_s).grep(/state|progress/i)
  end
end

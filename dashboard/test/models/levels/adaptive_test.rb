require 'test_helper'

class AdaptiveTest < ActiveSupport::TestCase
  setup do
    @dir = Pathname.new(Dir.mktmpdir)
    @dir.join('skills').mkpath
    @dir.join('sample.json').write({'id' => 'sample', 'title' => 'Sample'}.to_json)
    @dir.join('needs-skill.json').write({
      'id' => 'needs-skill',
      'steps' => [{'id' => 'tree', 'kind' => 'skillTree', 'skills' => [{'skillId' => 'ghost'}]}],
    }.to_json
)
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

  test "counts as a level with essential AI chat tools" do
    assert_includes Level.with_essential_ai_chat_tools, create(:adaptive)
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
    assert_equal 'Sample', properties[:pathway]['title']
  end

  test "lab2 properties carry no user-specific keys" do
    level = create(:adaptive)
    script_level = create(:script_level, levels: [level])

    properties = level.summarize_for_lab2_properties(script_level.script, script_level, create(:student))

    assert_empty properties.keys.map(&:to_s).grep(/state|progress/i)
  end

  test "lab2 properties inline each referenced level's properties" do
    template = create(:weblab2, name: 'adaptive-test-template')
    sandbox = create(:weblab2, name: 'adaptive-test-sandbox')
    write_levels_pathway

    pathway = create(:adaptive, adaptive_id: 'levels').summarize_for_lab2_properties(nil, nil, create(:student))[:pathway]

    assert_equal template.id, pathway['project']['levelProperties'][:id]
    try, ghost, read = pathway['checkpoints'][0]['steps']
    assert_equal sandbox.id, try['levelProperties'][:id]
    assert_equal 'weblab2', try['levelProperties'][:appName]
    refute ghost.key?('levelProperties'), 'an unknown level name passes through unresolved'
    refute read.key?('levelProperties'), 'only level steps are resolved'
  end

  test "resolving levels leaves the cached pathway untouched" do
    create(:weblab2, name: 'adaptive-test-sandbox')
    write_levels_pathway

    create(:adaptive, adaptive_id: 'levels').summarize_for_lab2_properties(nil, nil, create(:student))

    cached = AdaptiveContent.load('levels')
    refute cached['project'].key?('levelProperties')
    refute cached['checkpoints'][0]['steps'][0].key?('levelProperties')
  end

  test "find_step finds authored steps and the project screen's step" do
    write_levels_pathway
    level = create(:adaptive, adaptive_id: 'levels')

    assert_equal 'level', level.find_step('try')['kind']
    assert_equal 'panels', level.find_step('read')['kind']
    project = level.find_step('project')
    assert_equal 'level', project['kind']
    assert_equal 'adaptive-test-template', project['level']
    assert_nil level.find_step('unknown')
  end

  test "step_levels lists each existing level step's level by step id" do
    template = create(:weblab2, name: 'adaptive-test-template')
    sandbox = create(:weblab2, name: 'adaptive-test-sandbox')
    write_levels_pathway
    level = create(:adaptive, adaptive_id: 'levels')

    assert_equal({'try' => sandbox}, level.step_levels)
    assert level.step_level?(sandbox)
    refute level.step_level?(template), "the project's template level is not a step level"
  end

  test "lookups are empty without content" do
    level = build(:adaptive, adaptive_id: 'levels')

    assert_nil level.find_step('try')
    assert_empty level.step_levels
  end

  private def write_levels_pathway
    @dir.join('levels.json').write({
      'id' => 'levels',
      'project' => {'templateLevel' => 'adaptive-test-template', 'description' => 'A site.'},
      'checkpoints' => [{
        'id' => 'basics',
        'steps' => [
          {'id' => 'try', 'kind' => 'level', 'level' => 'adaptive-test-sandbox'},
          {'id' => 'ghost', 'kind' => 'level', 'level' => 'adaptive-test-missing'},
          {'id' => 'read', 'kind' => 'panels', 'panels' => []},
        ],
      }],
    }.to_json
)
    AdaptiveContent.reset_cache!
  end
end

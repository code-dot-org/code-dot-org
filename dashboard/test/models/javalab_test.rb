require 'test_helper'

class JavalabTest < ActiveSupport::TestCase
  test 'can parse serialized_maze' do
    neighborhood_data = {game_id: 68, level_num: "custom", name: "sample_neighborhood"}
    serialized_maze = "[[{\"tileType\": 0, \"assetId\": 13, \"value\": 0}],[{\"tileType\":1,\"value\":0}]]"
    neighborhood_data[:properties] = {
      serialized_maze: serialized_maze,
      csa_view_mode: "neighborhood"
    }

    neighborhood_level = Javalab.create(neighborhood_data)
    refute_empty(neighborhood_level.serialized_maze)
    assert_equal(2, neighborhood_level.serialized_maze.size)
  end

  test 'neighborhood level requires serialized_maze' do
    neighborhood_data = {game_id: 68, level_num: "custom", name: "sample_neighborhood"}
    neighborhood_data[:properties] = {
      csa_view_mode: "neighborhood"
    }

    assert_raises ArgumentError do
      Javalab.create(neighborhood_data)
    end
  end

  test 'get_serialized_maze returns template level maze if level doesnt have one' do
    template_data = {game_id: 68, level_num: "custom", name: "template_neighborhood"}
    serialized_maze = "[[{\"tileType\": 0, \"assetId\": 13, \"value\": 0}],[{\"tileType\":1,\"value\":0}]]"
    template_data[:properties] = {
      serialized_maze: serialized_maze,
      csa_view_mode: "neighborhood"
    }
    template_level = Javalab.create(template_data)

    neighborhood_data = {game_id: 68, level_num: "custom", name: "sample_neighborhood"}
    neighborhood_data[:properties] = {
      csa_view_mode: "neighborhood",
      project_template_level_name: template_level.name
    }
    neighborhood_level = Javalab.create(neighborhood_data)
    assert_equal template_level.get_serialized_maze, neighborhood_level.get_serialized_maze
  end

  test 'uses_lab2? defaults to false and is opt-in per level' do
    legacy = create(:javalab, name: "legacy_javalab")
    refute_predicate legacy, :uses_lab2?

    lab2 = create(:javalab, name: "lab2_javalab")
    lab2.uses_lab2 = true
    lab2.save!
    assert_predicate lab2, :uses_lab2?
  end

  test 'convert_legacy_start_sources handles a single starter file' do
    result = Javalab.convert_legacy_start_sources({'Main.java' => 'class Main {}'}, nil)
    assert_equal({'root' => {'id' => 'root', 'name' => 'src', 'parentId' => '0'}}, result['folders'])
    assert_equal 1, result['files'].size
    file = result['files'].values.first
    assert_equal 'Main.java', file['name']
    assert_equal 'class Main {}', file['contents']
    assert_equal 'starter', file['type']
    assert_equal [file['id']], result['openFiles']
  end

  test 'convert_legacy_start_sources segregates validation files' do
    result = Javalab.convert_legacy_start_sources(
      {'A.java' => 'a', 'B.java' => 'b'},
      {'TestA.java' => 'test a'},
    )
    starters = result['files'].values.select {|f| f['type'] == 'starter'}
    validations = result['files'].values.select {|f| f['type'] == 'validation'}
    assert_equal 2, starters.size
    assert_equal 1, validations.size
    assert_equal 'TestA.java', validations.first['name']
    # Only the first starter file should be open.
    assert_equal 1, result['openFiles'].size
  end

  test 'convert_legacy_start_sources unwraps nested {text, isVisible} entries' do
    result = Javalab.convert_legacy_start_sources(
      {'MyClass.java' => {'text' => 'class MyClass {}', 'isVisible' => true}},
      nil,
    )
    file = result['files'].values.first
    assert_equal 'class MyClass {}', file['contents']
    assert_equal 'MyClass.java', file['name']
  end

  test 'convert_legacy_start_sources is idempotent on MultiFileSource shape' do
    new_shape = {
      'folders' => {'root' => {'id' => 'root', 'name' => 'src', 'parentId' => '0'}},
      'files' => {'f0' => {'id' => 'f0', 'name' => 'Main.java', 'contents' => '', 'folderId' => 'root', 'type' => 'starter'}},
      'openFiles' => ['f0'],
    }
    assert_equal new_shape, Javalab.convert_legacy_start_sources(new_shape, nil)
  end

  test 'convert_legacy_start_sources handles nil and empty input' do
    [nil, {}].each do |empty|
      result = Javalab.convert_legacy_start_sources(empty, nil)
      assert_empty result['files']
      assert_empty result['openFiles']
    end
  end

  test 'summarize_for_lab2_properties converts startSources into MultiFileSource' do
    level = create(:javalab, name: "summarize_basic")
    level.properties['start_sources'] = {'Main.java' => 'class Main {}'}
    level.save!
    summary = level.summarize_for_lab2_properties(nil)
    assert_kind_of Hash, summary['startSources']
    assert(summary['startSources']['files'].any? {|_, f| f['name'] == 'Main.java'})
  end

  test 'summarize_for_lab2_properties strips encrypted blobs' do
    level = create(:javalab, name: "summarize_encrypted")
    # Write raw encrypted_* keys directly; the model's encrypted setters would
    # try to encrypt cleartext, but we just want to assert that whatever raw
    # blob is on disk never reaches the camelized client output.
    level.properties['start_sources'] = {'Main.java' => ''}
    level.properties['encrypted_validation'] = 'BLOB'
    level.properties['encrypted_exemplar_sources'] = 'BLOB'
    level.save!
    summary = level.summarize_for_lab2_properties(nil)
    refute summary.key?('encryptedValidation')
    refute summary.key?('encryptedExemplarSources')
  end

  test 'get_validations returns one PASSED_ALL_TESTS condition when validated' do
    validated = create(:javalab, name: "validated_level")
    # Bypass the encrypted setter (requires the encryption key) by writing the
    # raw property; get_validations only checks for presence.
    validated.properties['encrypted_validation'] = 'BLOB'
    validated.save!
    assert_equal 1, validated.get_validations.size
    assert_equal 'PASSED_ALL_TESTS', validated.get_validations.first[:conditions].first[:name]

    unvalidated = create(:javalab, name: "unvalidated_level")
    assert_nil unvalidated.get_validations
  end
end

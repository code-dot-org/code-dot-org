require 'test_helper'

class JitPlConceptTest < ActiveSupport::TestCase
  test "can create jit pl concept" do
    concept = create(:jit_pl_concept)
    assert concept.name
    assert concept.display_name
    assert concept.text_content
  end

  test "name uniqueness ignores casing" do
    create(:jit_pl_concept, name: 'Recursion')
    assert_raises ActiveRecord::RecordInvalid do
      JitPlConcept.create!(name: 'recursion')
    end
  end

  test "serialize returns correct hash" do
    concept = create(:jit_pl_concept, name: 'recursion', display_name: 'Recursion', text_content: 'A function calling itself.')
    serialized = concept.serialize
    assert_equal concept.id, serialized[:id]
    assert_equal 'recursion', serialized[:name]
    assert_equal 'Recursion', serialized[:display_name]
    assert_equal 'A function calling itself.', serialized[:text_content]
    assert_equal [], serialized[:resources]
  end

  test "text_content is stored in properties" do
    concept = create(:jit_pl_concept, text_content: 'Some content')
    concept.reload
    assert_equal 'Some content', concept.text_content
    assert_equal 'Some content', concept.properties['text_content']
  end

  test "seed_record creates a new concept from file" do
    name = 'loops'
    display_name = 'Loops'
    text_content = 'Repeating a block of code.'
    data = {name: name, display_name: display_name, text_content: text_content}

    File.stubs(:read).returns(data.to_json)

    new_id = JitPlConcept.seed_record('config/jit_pl_concepts/loops.json')
    seeded = JitPlConcept.find(new_id)

    assert_equal name, seeded.name
    assert_equal display_name, seeded.display_name
    assert_equal text_content, seeded.text_content
  end

  test "seed_record updates an existing concept from file" do
    concept = create(:jit_pl_concept, name: 'variables', display_name: 'Variables', text_content: 'Old content')
    updated = {name: 'variables', display_name: 'Variables Updated', text_content: 'New content'}

    File.stubs(:read).returns(updated.to_json)

    JitPlConcept.seed_record('config/jit_pl_concepts/variables.json')
    concept.reload

    assert_equal 'Variables Updated', concept.display_name
    assert_equal 'New content', concept.text_content
  end

  test "serialize includes associated resources" do
    concept = create(:jit_pl_concept)
    resource = create(:resource, name: 'My Resource')
    concept.resources << resource

    serialized = concept.serialize
    assert_equal 1, serialized[:resources].length
    assert_equal resource.id, serialized[:resources].first[:id]
    assert_equal resource.name, serialized[:resources].first[:name]
  end

  test "properties_from_file correctly parses resource and join table data written by write_serialization" do
    concept = create(:jit_pl_concept, name: 'loops')
    resource = create(:resource, name: 'My Resource')
    concept.resources << resource

    # Build the file content the same way write_serialization does
    file_content = JSON.pretty_generate({
                                          name: concept.name,
                                          display_name: concept.display_name,
                                          text_content: concept.text_content,
                                          resources: concept.resources.map {|r| {key: r.key, name: r.name, url: r.url, properties: r.properties.sort.to_h}},
                                          jit_pl_concepts_resources: concept.resources.map {|r| {seeding_key: {'concept.name' => concept.name, 'resource.key' => r.key}}},
                                        }
    )

    properties = JitPlConcept.properties_from_file(file_content)

    assert_equal 1, properties[:resources].length
    assert_equal resource.key, properties[:resources].first['key']
    assert_equal resource.name, properties[:resources].first['name']
    assert_equal 1, properties[:jit_pl_concepts_resources].length
    assert_equal 'loops', properties[:jit_pl_concepts_resources].first['seeding_key']['concept.name']
    assert_equal resource.key, properties[:jit_pl_concepts_resources].first['seeding_key']['resource.key']
  end

  test "properties_from_file parses resources and join table" do
    data = {
      name: 'loops',
      display_name: 'Loops',
      text_content: 'Repeating code.',
      resources: [{key: 'my-resource', name: 'My Resource', url: 'http://example.com', properties: {}}],
      jit_pl_concepts_resources: [{seeding_key: {'concept.name' => 'loops', 'resource.key' => 'my-resource'}}]
    }

    properties = JitPlConcept.properties_from_file(data.to_json)

    assert_equal 'loops', properties[:name]
    assert_equal 1, properties[:resources].length
    assert_equal 'my-resource', properties[:resources].first['key']
    assert_equal 1, properties[:jit_pl_concepts_resources].length
    assert_equal 'my-resource', properties[:jit_pl_concepts_resources].first['seeding_key']['resource.key']
  end

  test "serialize includes misconceptions" do
    concept = create(:jit_pl_concept)
    misconception = create(:jit_pl_misconception, jit_pl_concept: concept, name: 'bad-idea', text_content: 'Wrong.')

    serialized = concept.serialize
    assert_equal 1, serialized[:misconceptions].length
    assert_equal misconception.id, serialized[:misconceptions].first[:id]
    assert_equal 'bad-idea', serialized[:misconceptions].first[:name]
    assert_equal 'Wrong.', serialized[:misconceptions].first[:text_content]
  end

  test "seed_record creates misconceptions from file" do
    concept = create(:jit_pl_concept, name: 'functions')
    data = {
      name: 'functions',
      display_name: 'Functions',
      text_content: 'Reusable code.',
      resources: [],
      jit_pl_concepts_resources: [],
      misconceptions: [
        {name: 'bad-idea', text_content: 'Wrong.', resources: [], jit_pl_misconceptions_resources: []}
      ]
    }

    File.stubs(:read).returns(data.to_json)

    JitPlConcept.seed_record('config/jit_pl_concepts/functions.json')

    concept.reload
    assert_equal 1, concept.jit_pl_misconceptions.count
    assert_equal 'bad-idea', concept.jit_pl_misconceptions.first.name
  end

  test "seed_record removes misconceptions absent from file" do
    concept = create(:jit_pl_concept, name: 'loops')
    _to_remove = create(:jit_pl_misconception, jit_pl_concept: concept, name: 'old-idea')
    data = {
      name: 'loops',
      display_name: 'Loops',
      text_content: 'Repeating.',
      resources: [],
      jit_pl_concepts_resources: [],
      misconceptions: []
    }

    File.stubs(:read).returns(data.to_json)

    JitPlConcept.seed_record('config/jit_pl_concepts/loops.json')

    concept.reload
    assert_empty concept.jit_pl_misconceptions
  end

  test "seed_all removes concepts with no corresponding file" do
    concept_to_keep = create(:jit_pl_concept)
    concept_to_remove = create(:jit_pl_concept)

    Dir.stubs(:glob).returns(["config/jit_pl_concepts/#{concept_to_keep.name}.json"])
    File.stubs(:read).returns(concept_to_keep.serialize.to_json)

    JitPlConcept.seed_all

    assert JitPlConcept.exists?(concept_to_keep.id)
    refute JitPlConcept.exists?(concept_to_remove.id)
  end
end

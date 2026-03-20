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

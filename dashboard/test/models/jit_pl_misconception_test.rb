require 'test_helper'

class JitPlMisconceptionTest < ActiveSupport::TestCase
  test "can create jit pl misconception" do
    misconception = create(:jit_pl_misconception)
    assert misconception.name
    assert misconception.jit_pl_concept
  end

  test "serialize returns correct hash" do
    concept = create(:jit_pl_concept)
    misconception = create(:jit_pl_misconception, jit_pl_concept: concept, name: 'bad-idea', text_content: 'This is wrong.')

    serialized = misconception.serialize
    assert_equal misconception.id, serialized[:id]
    assert_equal 'bad-idea', serialized[:name]
    assert_equal 'This is wrong.', serialized[:text_content]
    assert_equal [], serialized[:resources]
  end

  test "serialize includes associated resources" do
    misconception = create(:jit_pl_misconception)
    resource = create(:resource, name: 'My Resource')
    misconception.resources << resource

    serialized = misconception.serialize
    assert_equal 1, serialized[:resources].length
    assert_equal resource.id, serialized[:resources].first[:id]
  end

  test "text_content is stored in properties" do
    misconception = create(:jit_pl_misconception, text_content: 'Some content')
    misconception.reload
    assert_equal 'Some content', misconception.text_content
    assert_equal 'Some content', misconception.properties['text_content']
  end
end

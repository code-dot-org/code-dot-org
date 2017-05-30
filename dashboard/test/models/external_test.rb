require 'test_helper'

class ExternalTest < ActiveSupport::TestCase
  setup do
    dsl_text = <<DSL
name 'user_id_replace'
title 'title for user_id_replace'
markdown 'this is the markdown for <user_id/>'
DSL
    @level = External.create_from_level_builder({}, {name: 'my_user_id_replace', dsl_text: dsl_text})
  end

  test "replaces <user_id/> with user's id" do
    user1 = create :user
    user2 = create :user
    properties1 = @level.properties_with_replaced_markdown(user1)
    properties2 = @level.properties_with_replaced_markdown(user2)

    assert_equal("this is the markdown for #{user1.id}", properties1['markdown'])
    assert_equal("this is the markdown for #{user2.id}", properties2['markdown'])

    # make sure we didn't lose other properties
    assert_equal('title for user_id_replace', properties1['title'])
  end

  test "replaces <user_id/> with empty string if no user" do
    properties = @level.properties_with_replaced_markdown(nil)
    assert_equal("this is the markdown for ", properties['markdown'])
  end
end

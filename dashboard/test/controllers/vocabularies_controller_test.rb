require 'test_helper'

class VocabulariesControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    @levelbuilder = create :levelbuilder
  end

  test "can create vocabulary from params" do
    sign_in @levelbuilder
    course_version = create :course_version
    assert_creates(Vocabulary) do
      post :create, params: {word: 'Algorithm', definition: 'definition of algorithm', courseVersionId: course_version.id}
      assert_response :success
    end
    assert(@response.body.include?('Algorithm'))
    assert(@response.body.include?('definition of algorithm'))
  end

  test "can update from params" do
    sign_in @levelbuilder
    course_version = create :course_version
    vocabulary = create :vocabulary, word: 'word', definition: 'draft definition', course_version: course_version
    post :update, params: {id: vocabulary.id, word: 'word', definition: 'updated definition', courseVersionId: course_version.id}
    assert_response :success

    vocabulary.reload
    assert_equal 'updated definition', vocabulary.definition
    assert(@response.body.include?('updated definition'))
  end

  test "creating vocabulary that already exists results in error" do
    sign_in @levelbuilder
    course_version = create :course_version
    vocabulary = create :vocabulary, key: 'variable', word: 'variable', definition: 'definition', course_version: course_version

    post :create, params: {word: 'variable', definition: 'different definition', courseVersionId: course_version.id}
    assert_response :bad_request

    # Check that the original vocabulary wasn't changed
    vocabulary.reload
    assert_equal 'definition', vocabulary.definition
  end
end

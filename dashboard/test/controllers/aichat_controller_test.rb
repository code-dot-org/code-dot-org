require 'test_helper'

class AichatControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @authorized_teacher1 = create :authorized_teacher
    unit_group = create :unit_group, name: 'exploring-gen-ai-2024'
    section = create :section, user: @authorized_teacher1, unit_group: unit_group
    @authorized_student1 = create(:follower, section: section).student_user
  end

  # *****
  # user_has_access tests
  # *****

  test 'signed out user does not have access to user_has_access test' do
    get :user_has_access, format: :json
    assert_response :forbidden
  end

  test 'GET user_has_access returns false for unauthorized teacher' do
    sign_in(create(:teacher))
    get :user_has_access, format: :json
    assert_response :success
    assert_equal json_response['userHasAccess'], false
  end

  test 'GET user_has_access returns true for authorized teacher' do
    sign_in(@authorized_teacher1)
    get :user_has_access, format: :json
    assert_response :success
    assert_equal json_response['userHasAccess'], true
  end

  test 'GET user_has_access returns false for unauthorized student' do
    sign_in(create(:student))
    get :user_has_access, format: :json
    assert_response :success
    assert_equal json_response['userHasAccess'], false
  end

  test 'GET user_has_access returns true for student of authorized teacher' do
    sign_in(@authorized_student1)
    get :user_has_access, format: :json
    assert_response :success
    assert_equal json_response['userHasAccess'], true
  end

  # *****
  # find_toxicity tests
  # *****

  [:student, :teacher].each do |user|
    test_user_gets_response_for :find_toxicity,
      name: "#{user}_no_access_find_toxicity_test",
      user: user,
      method: :post,
      response: :forbidden
  end

  test 'find_toxicity returns toxicity if detected in system prompt' do
    sign_in(@authorized_student1)
    system_prompt = 'hello system prompt'
    locale = 'en'
    toxicity_response = {text: system_prompt, blocked_by: 'openai', details: {}}
    AichatSafetyHelper.expects(:find_toxicity).with(system_prompt, nil).returns(toxicity_response)

    expected_response = {
      flaggedFields: [{field: 'systemPrompt', toxicity: toxicity_response.camelize_keys}]
    }.deep_stringify_keys

    post :find_toxicity, params: {systemPrompt: system_prompt, locale: locale}, as: :json
    assert_response :success
    assert_equal expected_response, json_response
  end

  test 'find_toxicity returns toxicity if detected in retrieval context' do
    sign_in(@authorized_student1)
    retrieval_contexts = ['retrieval1', 'retrieval2']
    locale = 'en'
    toxicity_response = {text: retrieval_contexts.join(' '), blocked_by: 'openai', details: {}}
    AichatSafetyHelper.expects(:find_toxicity).with(retrieval_contexts.join(' '), nil).returns(toxicity_response)

    expected_response = {
      flaggedFields: [{field: 'retrievalContexts', toxicity: toxicity_response.camelize_keys}]
    }.deep_stringify_keys

    post :find_toxicity, params: {retrievalContexts: retrieval_contexts, locale: locale}, as: :json
    assert_response :success
    assert_equal expected_response, json_response
  end

  test 'find_toxicity returns toxicity if detected in both system prompt and retrieval contexts' do
    sign_in(@authorized_student1)
    system_prompt = 'hello system prompt'
    retrieval_contexts = ['retrieval1', 'retrieval2']
    locale = 'en'
    toxicity_response_system_prompt = {text: system_prompt, blocked_by: 'openai', details: {}}
    toxicity_response_retrieval_contexts = {text: retrieval_contexts.join(' '), blocked_by: 'openai', details: {}}
    AichatSafetyHelper.expects(:find_toxicity).with(system_prompt, nil).returns(toxicity_response_system_prompt)
    AichatSafetyHelper.expects(:find_toxicity).with(retrieval_contexts.join(' '), nil).returns(toxicity_response_retrieval_contexts)

    expected_response = {
      flaggedFields: [
        {field: 'systemPrompt', toxicity: toxicity_response_system_prompt.camelize_keys},
        {field: 'retrievalContexts', toxicity: toxicity_response_retrieval_contexts.camelize_keys}
      ]
    }.deep_stringify_keys

    post :find_toxicity, params: {systemPrompt: system_prompt, retrievalContexts: retrieval_contexts, locale: locale}, as: :json
    assert_response :success
    assert_equal expected_response, json_response
  end

  test 'find_toxicity returns empty flagged fields if no toxicity detected' do
    sign_in(@authorized_student1)
    system_prompt = 'hello system prompt'
    retrieval_contexts = ['retrieval1', 'retrieval2']
    locale = 'en'
    AichatSafetyHelper.expects(:find_toxicity).twice.returns(nil)

    expected_response = {
      flaggedFields: []
    }.deep_stringify_keys

    post :find_toxicity, params: {systemPrompt: system_prompt, retrievalContexts: retrieval_contexts, locale: locale}, as: :json
    assert_response :success
    assert_equal expected_response, json_response
  end
end

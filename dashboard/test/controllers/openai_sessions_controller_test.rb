require 'test_helper'

class OpenaiSessionsControllerTest < ActionController::TestCase
  setup do
    @rsa_key_test = OpenSSL::PKey::RSA.new(2048)
    OpenSSL::PKey::RSA.stubs(:new).returns(@rsa_key_test)
    @fake_channel_id = storage_encrypt_channel_id(1, 1)

    # JavalabFilesHelper.stubs(:get_project_files).returns({})
    # JavalabFilesHelper.stubs(:get_project_files_with_override_sources).returns({})
    # JavalabFilesHelper.stubs(:get_project_files_with_override_validation).returns({})
    # put_response = Net::HTTPResponse.new(nil, '200', nil)
    # JavalabFilesHelper.stubs(:upload_project_files).returns(put_response)
  end

  test_user_gets_response_for :chat_completion,
  method: :post,
  user: :student,
  response: :forbidden

  test_user_gets_response_for :chat_completion,
  user: :teacher,
  response: :forbidden

  # test_user_gets_response_for :chat_completion,
  # user: :ai_chat_access,
  # response: :success
end

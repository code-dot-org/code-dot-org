require 'test_helper'

class AichatRequestTest < ActiveSupport::TestCase
  # The character that breaks Redshift SUPER ingestion (Zero ETL load error 1224). Referenced from
  # the shared concern's constant so there is never a literal NUL byte typed into this source file.
  # The generic stripping behavior is covered by SanitizesNullBytesTest; these tests only confirm
  # AichatRequest is wired up (via `export_to_analytics`) and cleans its own columns.
  NUL = SanitizesNullBytes::NULL_BYTE

  describe 'stripping NUL bytes on save' do
    it 'strips NUL from new_message and stored_messages before persisting' do
      request = create(
        :aichat_request,
        new_message: {'chatMessageText' => "hello#{NUL}world", 'role' => 'user'},
        stored_messages: [{'chatMessageText' => "prior#{NUL}", 'role' => 'assistant'}]
      )
      request.reload

      _(request.new_message['chatMessageText']).must_equal 'helloworld'
      _(request.stored_messages.first['chatMessageText']).must_equal 'prior'
    end

    it 'strips NUL from model_customizations' do
      request = create(:aichat_request, model_customizations: {'systemPrompt' => "be#{NUL}nice"})
      _(request.reload.model_customizations['systemPrompt']).must_equal 'benice'
    end

    it 'leaves clean payloads byte-for-byte intact' do
      new_message = {'chatMessageText' => 'clean', 'role' => 'user'}
      request = create(:aichat_request, new_message: new_message)
      _(request.reload.new_message).must_equal new_message
    end

    it 'logs the offending record by id and column, never the stripped data' do
      logged = nil
      CDO.log.stubs(:warn).with do |message|
        logged = message if message.to_s.include?('[SanitizesNullBytes]')
        true
      end

      request = create(:aichat_request, new_message: {'chatMessageText' => "topsecret#{NUL}payload"})

      _(logged).wont_be_nil
      _(logged).must_include "AichatRequest##{request.id}" # identifies the row (id populated post-create)
      _(logged).must_include 'new_message'
      _(logged).wont_include 'topsecret' # the (possibly sensitive/long) value is never logged
    end

    it 'also strips NUL from the response TEXT column on a later update' do
      request = create(:aichat_request, new_message: {'chatMessageText' => "x#{NUL}"})
      request.update!(
        response: "resp#{NUL}onse",
        execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS]
      )
      request.reload

      _(request.response).must_equal 'response'
      _(request.new_message['chatMessageText']).must_equal 'x' # cleaned at create, untouched now
    end
  end
end

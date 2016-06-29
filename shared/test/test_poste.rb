require_relative 'test_helper'
require 'mocha/test_unit'
require 'cdo/poste'

class PosteTest < Minitest::Test

  FROM_NAME = 'Code dot org'.freeze
  FROM_EMAIL = 'noreply@code.org'.freeze
  REPLY_TO_NAME = 'Reply-to Person'.freeze
  REPLY_TO_EMAIL = 'reply.to.person@example.net'.freeze
  TO_NAME = 'Recipient Person'.freeze
  TO_EMAIL = 'recipient.person@example.net'.freeze
  SUBJECT = 'this is a subject'.freeze
  BODY = 'blah blah blah'.freeze
  CONTENT_TYPE = 'text/html; charset=UTF-8'.freeze
  IP = '127.0.0.1'.freeze

  def setup
    @mail = Mail.new
    @mail.from = "#{FROM_NAME} <#{FROM_EMAIL}>"
    @mail.reply_to = "#{REPLY_TO_NAME} <#{REPLY_TO_EMAIL}>"
    @mail.to = "#{TO_NAME} <#{TO_EMAIL}>"
    @mail.subject = SUBJECT
    @mail.body = BODY
    @mail.content_type = CONTENT_TYPE

    @delivery_method = Poste2::DeliveryMethod.new
  end

  def test_delivery_method
    mock_recipient = {id: -1, email: TO_EMAIL, name: TO_NAME, ip_address: IP}

    Poste2.expects(:ensure_recipient).with(
      TO_EMAIL,
      name: TO_NAME,
      ip_address: IP
    ).returns(mock_recipient).times(2)

    # With Reply-to
    Poste2.expects(:send_message).with(
      'dashboard',
      mock_recipient,
      body: BODY,
      subject: SUBJECT,
      from: "#{FROM_NAME} <#{FROM_EMAIL}>",
      reply_to: "#{REPLY_TO_NAME} <#{REPLY_TO_EMAIL}>"
    )
    @delivery_method.deliver!(@mail)

    # Without Reply-to
    @mail.reply_to = nil
    Poste2.expects(:send_message).with(
      'dashboard',
      mock_recipient,
      body: BODY,
      subject: SUBJECT,
      from: "#{FROM_NAME} <#{FROM_EMAIL}>"
    )
    @delivery_method.deliver!(@mail)
  end

  def test_no_recipient
    @mail.to = nil

    e = assert_raises ArgumentError do
      @delivery_method.deliver!(@mail)
    end
    assert e.message.include? 'Recipient (to field) is required.'
  end

  def test_unsupported_sender
    @mail.from = 'not_allowed@code.org'

    e = assert_raises ArgumentError do
      @delivery_method.deliver!(@mail)
    end
    assert e.message.include? 'Unsupported sender'
  end

  def test_unsupported_message_type
    @mail.content_type = 'unsupported'

    e = assert_raises ArgumentError do
      @delivery_method.deliver!(@mail)
    end
    assert e.message.include? 'Unsupported message type'
  end
end

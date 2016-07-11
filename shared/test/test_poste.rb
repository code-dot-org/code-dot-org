require_relative 'test_helper'
require 'mocha/test_unit'
require 'cdo/poste'
require 'digest/md5'

class PosteTest < Minitest::Test
  SUBSCRIBED_EMAIL = 'subscribed@example.net'
  SUBSCRIBED_EMAIL_HASH = Digest::MD5.hexdigest(SUBSCRIBED_EMAIL)
  UNSUBSCRIBED_EMAIL = 'unsubscribed@example.net'
  UNSUBSCRIBED_EMAIL_HASH = Digest::MD5.hexdigest(UNSUBSCRIBED_EMAIL)

  def setup
    Poste2.create_recipient(
      SUBSCRIBED_EMAIL, {name: 'Subscriber', ip_address: '1.2.3.4'})
    Poste2.create_recipient(
      UNSUBSCRIBED_EMAIL, {name: 'Unsubscriber', ip_address: '9.8.7.6'})
    Poste.unsubscribe(UNSUBSCRIBED_EMAIL, UNSUBSCRIBED_EMAIL_HASH)
  end

  def test_unsubscribed_for_unsubscribed_contact
    assert Poste.unsubscribed?(UNSUBSCRIBED_EMAIL_HASH)
  end

  def test_unsubscribed_for_subscribed_contact
    assert !Poste.unsubscribed?(SUBSCRIBED_EMAIL_HASH)
  end

  def test_unsubscribe_for_existing_contact
    email = 'existing@example.net'
    Poste2.create_recipient(email, {ip_address: '5.6.7.8.'})
    Poste.unsubscribe(email, Digest::MD5.hexdigest(email))
    assert POSTE_DB[:contacts].where(email: email).first[:unsubscribed_at]
  end

  def test_unsubscribe_for_new_contact
    email = 'new@example.net'
    Poste.unsubscribe(
      email, Digest::MD5.hexdigest(email), {ip_address: '5.6.7.8.'})
    assert POSTE_DB[:contacts].where(email: email).first[:unsubscribed_at]
  end
end

class Poste2Test < Minitest::Test
  FROM_NAME = 'Code dot org'
  FROM_EMAIL = 'noreply@code.org'
  REPLY_TO_NAME = 'Reply-to Person'
  REPLY_TO_EMAIL = 'reply.to.person@example.net'
  TO_NAME = 'Recipient Person'
  TO_EMAIL = 'recipient.person@example.net'
  SUBJECT = 'this is a subject'
  BODY = 'blah blah blah'
  CONTENT_TYPE = 'text/html; charset=UTF-8'
  IP = '127.0.0.1'
  MULTIPART_CONTENT_TYPE = 'multipart/mixed'
  ATTACHMENT_FILENAME = 'file.txt'
  ATTACHMENT_CONTENT = 'hello world'

  def setup
    @mail = Mail.new
    @mail.from = "#{FROM_NAME} <#{FROM_EMAIL}>"
    @mail.reply_to = "#{REPLY_TO_NAME} <#{REPLY_TO_EMAIL}>"
    @mail.to = "#{TO_NAME} <#{TO_EMAIL}>"
    @mail.subject = SUBJECT
    @mail.body = BODY
    @mail.content_type = CONTENT_TYPE

    @delivery_method = Poste2::DeliveryMethod.new

    @mock_recipient = {id: -1, email: TO_EMAIL, name: TO_NAME, ip_address: IP}
  end

  def test_delivery_method
    Poste2.expects(:ensure_recipient).with(
      TO_EMAIL,
      name: TO_NAME,
      ip_address: IP
    ).returns(@mock_recipient).times(2)

    # With Reply-to
    Poste2.expects(:send_message).with(
      'dashboard',
      @mock_recipient,
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
      @mock_recipient,
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

  def test_multipart_mail
    mail = Mail.new(
      content_type: MULTIPART_CONTENT_TYPE,
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject: SUBJECT
    )
    mail.attachments[ATTACHMENT_FILENAME] = ATTACHMENT_CONTENT
    mail.body = BODY
    mail.parts.last.content_type = CONTENT_TYPE

    Poste2.expects(:ensure_recipient).with(
      TO_EMAIL,
      name: nil,
      ip_address: IP
    ).returns(@mock_recipient)

    Poste2.expects(:send_message).with(
      'dashboard',
      @mock_recipient,
      body: BODY,
      subject: SUBJECT,
      from: FROM_EMAIL,
      attachments: {ATTACHMENT_FILENAME => ATTACHMENT_CONTENT}
    )
    @delivery_method.deliver!(mail)
  end
end

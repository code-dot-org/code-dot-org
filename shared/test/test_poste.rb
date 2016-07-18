require_relative 'test_helper'
require_relative '../../pegasus/test/sequel_test_case'
require 'mocha/mini_test'
require 'cdo/poste'
require 'digest/md5'

class PosteTest < SequelTestCase
  STUDENT_EMAIL = 'student@example.net'.freeze
  STUDENT_EMAIL_HASH = Digest::MD5.hexdigest(STUDENT_EMAIL).freeze
  TEACHER_EMAIL = 'teacher@example.net'.freeze
  TEACHER_EMAIL_HASH = Digest::MD5.hexdigest(TEACHER_EMAIL).freeze

  def setup
    DASHBOARD_DB[:users].insert({
      email: STUDENT_EMAIL,
      hashed_email: STUDENT_EMAIL_HASH,
      username: 'code studio student',
      user_type: 'student',
      birthday: '2000-01-02'
    })
    DASHBOARD_DB[:users].insert({
      email: TEACHER_EMAIL,
      hashed_email: TEACHER_EMAIL_HASH,
      username: 'code studio teacher',
      user_type: 'teacher',
      birthday: '2000-01-02'
    })
  end

  def test_unsubscribe_for_existing_contact
    email = 'existing@example.net'
    hashed_email = Digest::MD5.hexdigest(email)

    Poste2.create_recipient(email, {ip_address: '5.6.7.8.'})
    assert POSTE_DB[:contacts].where(hashed_email: hashed_email).first

    Poste.unsubscribe(email, Digest::MD5.hexdigest(email))
    assert POSTE_DB[:contacts].
      where(hashed_email: hashed_email).first[:unsubscribed_at]
  end

  def test_unsubscribe_for_new_contact
    email = 'new@example.net'
    hashed_email = Digest::MD5.hexdigest(email)

    assert POSTE_DB[:contacts].where(hashed_email: hashed_email).empty?
    Poste.unsubscribe(
      email, Digest::MD5.hexdigest(email), {ip_address: '5.6.7.8.'})
    assert POSTE_DB[:contacts].
      where(hashed_email: hashed_email).first[:unsubscribed_at]
  end

  def test_unsubscribe_for_code_studio_student_stores_no_email
    Poste.unsubscribe(
      STUDENT_EMAIL, STUDENT_EMAIL_HASH, {ip_address: '1.2.3.4'})

    assert POSTE_DB[:contacts].
      where(hashed_email: STUDENT_EMAIL_HASH).first[:unsubscribed_at]
    assert_nil POSTE_DB[:contacts].where(email: STUDENT_EMAIL).first
  end

  def test_unsubscribe_for_code_studio_teacher_stores_email
    Poste.unsubscribe(
      TEACHER_EMAIL, TEACHER_EMAIL_HASH, {ip_address: '1.2.3.4'})

    assert POSTE_DB[:contacts].
      where(hashed_email: TEACHER_EMAIL_HASH).first[:unsubscribed_at]
    assert POSTE_DB[:contacts].
      where(email: TEACHER_EMAIL).first[:unsubscribed_at]
  end

  def test_dashboard_student_for_nonuser
    email = 'nonexistent_email@fake_domain.com'
    hashed_email = Digest::MD5.hexdigest(email)
    assert !Poste.dashboard_student?(hashed_email)
  end

  def test_dashboard_student_for_student
    assert Poste.dashboard_student?(STUDENT_EMAIL_HASH)
  end

  def test_dashboard_student_for_teacher
    assert !Poste.dashboard_student?(TEACHER_EMAIL_HASH)
  end

  def test_encrypt_then_decrypt_noop
    my_string = 'ABCDEF'
    assert_equal my_string, Poste.decrypt(Poste.encrypt(my_string))
  end

  def test_decrypt_then_encrypt_noop
    my_string = 'ABCDEF'
    my_string_encrypted = Poste.encrypt(my_string)
    assert_equal my_string_encrypted,
      Poste.encrypt(Poste.decrypt(my_string_encrypted))
  end

  def test_encrypt_id_then_decrypt_id_noop
    my_int = 123456
    assert_equal my_int, Poste.decrypt_id(Poste.encrypt_id(my_int))
  end

  def test_decrypt_id_then_encrypt_id_noop
    my_int = 123456
    my_int_encrypted = Poste.encrypt_id(my_int)
    assert_equal my_int_encrypted,
      Poste.encrypt_id(Poste.decrypt_id(my_int_encrypted))
  end
end

class Poste2Test < SequelTestCase
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

  def test_create_recipient_for_bad_email
    bad_email = 'not_an_email'
    assert_raises ArgumentError do
      Poste2.create_recipient(bad_email)
    end
  end

  def test_create_recipient_for_new_contact
    email = 'new_contact@example.net'
    hashed_email = Digest::MD5.hexdigest(email)

    Poste2.create_recipient(email, {ip_address: '1.2.3.4'})
    assert POSTE_DB[:contacts].where(hashed_email: hashed_email).first
  end

  def test_create_recipient_for_existing_contact
    email = 'new_contact@example.net'
    hashed_email = Digest::MD5.hexdigest(email)
    id = POSTE_DB[:contacts].insert({
      email: email,
      hashed_email: hashed_email,
      created_at: DateTime.now,
      created_ip: '1.2.3.4',
      updated_at: DateTime.now,
      updated_ip: '1.2.3.4'
    })

    recipient = Poste2.create_recipient(email)
    assert_equal id, recipient[:id]
  end

  def test_create_recipient_for_dashboard_student
    email = 'student@example.com'
    hashed_email = Digest::MD5.hexdigest(email)
    DASHBOARD_DB[:users].insert(
      email: email,
      hashed_email: hashed_email,
      username: 'code studio student',
      user_type: 'student',
      birthday: '2000-01-02'
    )

    Poste2.create_recipient(email, {ip_address: '1.2.3.4'})
    assert POSTE_DB[:contacts].where(hashed_email: hashed_email).first
    assert !POSTE_DB[:contacts].where(email: email).first
  end

  def test_create_recipient_for_dashboard_teacher
    email = 'teacher@example.com'
    hashed_email = Digest::MD5.hexdigest(email)
    DASHBOARD_DB[:users].insert(
      email: email,
      hashed_email: hashed_email,
      username: 'code studio teacher',
      user_type: 'teacher',
      birthday: '2000-01-02'
    )

    Poste2.create_recipient(email, {ip_address: '1.2.3.4'})
    assert POSTE_DB[:contacts].where(hashed_email: hashed_email).first
    assert POSTE_DB[:contacts].where(email: email).first
  end

  def test_ensure_recipient_for_bad_email
    bad_email = 'not_an_email'
    assert_raises ArgumentError do
      Poste2.ensure_recipient(bad_email)
    end
  end

  def test_ensure_recipient_for_new_contact
    email = 'new_contact@example.net'
    hashed_email = Digest::MD5.hexdigest(email)

    assert POSTE_DB[:contacts].where(hashed_email: hashed_email).empty?
    Poste2.ensure_recipient(email, {ip_address: '1.2.3.4'})
    assert POSTE_DB[:contacts].where(hashed_email: hashed_email).first
  end

  def test_ensure_recipient_for_existing_contact
    email = 'existing_contact@example.net'
    hashed_email = Digest::MD5.hexdigest(email)
    POSTE_DB[:contacts].insert({
      email: email,
      hashed_email: hashed_email,
      created_at: DateTime.now,
      created_ip: '1.2.3.4',
      updated_at: DateTime.now,
      updated_ip: '1.2.3.4'
    })

    recipient = Poste2.ensure_recipient(email, {ip_address: '5.6.7.8'})
    # Intentional or not, the IP address returned is the IP address passed in.
    assert_equal '5.6.7.8', recipient[:ip_address]
    assert POSTE_DB[:contacts].where(hashed_email: hashed_email).first
    # Intentional or not, the IP address is not updated in the DB.
    assert_equal '1.2.3.4',
      POSTE_DB[:contacts].where(hashed_email: hashed_email).first[:created_ip]
  end
end

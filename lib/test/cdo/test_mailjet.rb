require_relative '../test_helper'
require 'cdo/mailjet'

class MailJetTest < Minitest::Test
  def setup
    MailJet.stubs(:enabled?).returns(true)
  end

  def test_create_contact
    email = 'fake.email@test.xx'
    name = 'Fake Name'

    Mailjet::Contact.expects(:create).with(is_excluded_from_campaigns: true, email: email, name: name)

    mock_contact = mock('Mailjet::Contactdata')
    Mailjet::Contactdata.stubs(:find).with(email).returns(nil).then.returns(mock_contact)

    time = Time.now.to_datetime
    mock_contact.expects(:update_attributes).with(data: [{name: 'sign_up_date', value: time.rfc3339}])

    MailJet.create_contact(email, name, time)
  end

  def test_create_contact_with_existing_contact
    email = 'fake.email@test.xx'
    name = 'Fake Name'

    mock_existing_contact = mock('Mailjet::Contactdata')
    mock_existing_contact.stubs(:id).returns(123)
    Mailjet::Contactdata.expects(:find).with(email).returns(mock_existing_contact)

    Mailjet::Contact.expects(:create).never

    time = Time.now.to_datetime
    mock_existing_contact.expects(:update_attributes).with(data: [{name: 'sign_up_date', value: time.rfc3339}])

    MailJet.create_contact(email, name, time)
  end

  def test_send_template_email
    to_email = 'fake.email@test.xx'
    to_name = 'Fake Name'
    from_address = 'test@code.org'
    from_name = 'Test Name'
    template_id = 123

    MailJet.stubs(:subaccount).returns('unit_test')

    email_config = {
      from_address: from_address,
      from_name: from_name,
      template_id: {
        unit_test: template_id
      }
    }

    MailJet.expects(:valid_email?).with(to_email).returns(true).once
    Mailjet::Send.expects(:create).with do |params|
      messages = params[:messages]
      messages.length == 1 &&
        messages[0][:From][:Email] == from_address &&
        messages[0][:From][:Name] == from_name &&
        messages[0][:To].length == 1 &&
        messages[0][:To][0][:Email] == to_email &&
        messages[0][:To][0][:Name] == to_name &&
        messages[0][:TemplateID] == template_id
    end

    MailJet.send_template_email(to_email, to_name, email_config)
  end

  def test_valid_email_deliverable
    Mailgun::Address.any_instance.expects(:validate).returns({'result' => 'deliverable'})
    assert MailJet.valid_email?('test@email.com')
  end

  def test_valid_email_undeliverable
    Mailgun::Address.any_instance.expects(:validate).returns({'result' => 'undeliverable'})
    refute MailJet.valid_email?('test@email.com')
  end

  def test_valid_email_do_not_send
    Mailgun::Address.any_instance.expects(:validate).returns({'result' => 'do_not_send'})
    refute MailJet.valid_email?('test@email.com')
  end
end

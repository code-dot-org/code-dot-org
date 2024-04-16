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

  def test_deletes_contact
    email = 'fake.email@test.xx'

    mock_contact = mock('Mailjet::Contact')
    mock_contact.stubs(:id).returns(123)
    Mailjet::Contact.expects(:find).with(email).returns(mock_contact)

    mock_http_request = mock('Net::HTTP::Delete')
    Net::HTTP::Delete.expects(:new).with(URI.parse("https://api.mailjet.com/v4/contacts/#{mock_contact.id}")).returns(mock_http_request)
    mock_http_request.expects(:basic_auth).once

    Net::HTTP.any_instance.expects(:request).with(mock_http_request)

    MailJet.delete_contact(email)
  end

  def test_deletes_handles_nonexistent_contact
    email = 'fake.email@test.xx'

    Mailjet::Contact.expects(:find).with(email).returns(nil)

    Net::HTTP::Delete.expects(:new).never
    Net::HTTP.any_instance.expects(:request).never

    MailJet.delete_contact(email)
  end
end

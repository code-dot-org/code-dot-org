require_relative '../test_helper'
require 'cdo/mailjet'

class MailJetTest < Minitest::Test
  def setup
    MailJet.stubs(:enabled?).returns(true)
  end

  def test_create_contact
    email = 'fake.email@email.com'
    name = 'Fake Name'

    Mailjet::Contact.expects(:create).with(is_excluded_from_campaigns: true, email: email, name: name)

    time = Time.now.to_datetime.rfc3339
    mock_contact = mock('Mailjet::Contactdata')
    Mailjet::Contactdata.expects(:find).with(email).returns(mock_contact)
    mock_contact.expects(:update_attributes).with(data: [{name: 'sign_up_date', value: time}])

    MailJet.create_contact(email, name, time)
  end

  def test_send_template_email
    to_email = 'fake.email@email.com'
    to_name = 'Fake Name'
    from_email = 'test@code.org'
    from_name = 'Test Name'
    template_id = 123

    Mailjet::Send.expects(:create).with do |params|
      messages = params[:messages]
      messages.length == 1 &&
        messages[0][:From][:Email] == from_email &&
        messages[0][:From][:Name] == from_name &&
        messages[0][:To].length == 1 &&
        messages[0][:To][0][:Email] == to_email &&
        messages[0][:To][0][:Name] == to_name &&
        messages[0][:TemplateID] == template_id
    end

    MailJet.send_template_email(to_email, from_email, to_name, from_name, template_id)
  end
end

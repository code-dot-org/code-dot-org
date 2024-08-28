require_relative '../test_helper'
require 'cdo/mailjet'

class MailJetTest < Minitest::Test
  def setup
    MailJet.stubs(:enabled?).returns(true)
  end

  def test_create_contact
    email = 'fake.email@test.xx'
    name = 'Fake Name'

    Mailjet::Contact.expects(:create).with(is_excluded_from_campaigns: false, email: email, name: name)

    mock_contact = mock('Mailjet::Contact')
    Mailjet::Contact.stubs(:find).with(email).returns(nil).then.returns(mock_contact)

    MailJet.expects(:valid_email?).with(email).returns(true).once

    refute_nil MailJet.find_or_create_contact(email, name)
  end

  def test_find_existing_contact
    email = 'fake.email@test.xx'
    name = 'Fake Name'

    mock_existing_contact = mock('Mailjet::Contact')
    mock_existing_contact.stubs(:id).returns(123)
    Mailjet::Contact.expects(:find).with(email).returns(mock_existing_contact)

    Mailjet::Contact.expects(:create).never

    MailJet.expects(:valid_email?).with(email).returns(true).once

    refute_nil MailJet.find_or_create_contact(email, name)
  end

  def test_invalid_email_does_not_create_contact
    email = 'invalid.email@'
    name = 'Fake Name'

    MailJet.expects(:valid_email?).with(email).returns(false).once
    Mailjet::Contact.expects(:create).never

    assert_nil MailJet.find_or_create_contact(email, name)
  end

  def test_update_contact_fields
    mock_contactdata = mock('Mailjet::Contactdata')
    mock_contactdata.stubs(:update_attributes).with(data: [{name: 'field_name', value: 'field_value'}])

    mock_contact_id = 123
    Mailjet::Contactdata.expects(:find).with(mock_contact_id).returns(mock_contactdata)
    mock_contact = mock('Mailjet::Contact')
    mock_contact.stubs(:id).returns(mock_contact_id)

    MailJet.update_contact_fields(mock_contact, [{name: 'field_name', value: 'field_value'}])
  end

  def test_send_template_email_default_locale_with_variables
    to_email = 'fake.email@test.xx'
    to_name = 'Fake Name'
    from_address = 'test@code.org'
    from_name = 'Test Name'
    template_id = 123
    variables = {'Var1' => 'Value1', 'Var2' => 'Value2'}.to_json

    MailJet.stubs(:subaccount).returns('unit_test')

    mock_contact = mock('Mailjet::Contact')
    mock_contact.stubs(:email).returns(to_email)
    mock_contact.stubs(:name).returns(to_name)

    email_config = {
      from_address: from_address,
      from_name: from_name,
      template_id: {
        unit_test: {
          default: template_id
        }
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
        messages[0][:TemplateID] == template_id &&
        messages[0][:Variables] == variables
    end

    MailJet.send_template_email(mock_contact, email_config, 'en-US', variables: variables)
  end

  def test_send_template_email_default_locale
    to_email = 'fake.email@test.xx'
    to_name = 'Fake Name'
    from_address = 'test@code.org'
    from_name = 'Test Name'
    template_id = 123

    MailJet.stubs(:subaccount).returns('unit_test')

    mock_contact = mock('Mailjet::Contact')
    mock_contact.stubs(:email).returns(to_email)
    mock_contact.stubs(:name).returns(to_name)

    email_config = {
      from_address: from_address,
      from_name: from_name,
      template_id: {
        unit_test: {
          default: template_id
        }
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

    MailJet.send_template_email(mock_contact, email_config, 'en-US')
  end

  def test_send_template_email_localized
    to_email = 'fake.email@test.xx'
    to_name = 'Fake Name'
    from_address = 'test@code.org'
    from_name = 'Test Name'
    default_template_id = 123
    localized_template_id = 456

    MailJet.stubs(:subaccount).returns('unit_test')

    mock_contact = mock('Mailjet::Contact')
    mock_contact.stubs(:email).returns(to_email)
    mock_contact.stubs(:name).returns(to_name)

    email_config = {
      from_address: from_address,
      from_name: from_name,
      template_id: {
        unit_test: {
          default: default_template_id,
          'es-MX': localized_template_id
        }
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
        messages[0][:TemplateID] == localized_template_id
    end

    MailJet.send_template_email(mock_contact, email_config, 'es-MX')
  end

  def test_create_contact_and_add_to_welcome_series
    email = 'fake.email@test.xx'
    sign_up_time = Time.now.to_datetime

    user = mock
    user.stubs(:id).returns(1)
    user.stubs(:email).returns(email)
    user.stubs(:name).returns('Fake Name')
    user.stubs(:teacher?).returns(true)
    user.stubs(:created_at).returns(sign_up_time)

    mock_contact_id = 123
    mock_contactdata = mock('Mailjet::Contactdata')
    mock_contact = mock('Mailjet::Contact')
    mock_contact.stubs(:id).returns(mock_contact_id)

    MailJet.expects(:find_or_create_contact).with(email, user.name).returns(mock_contact)

    Mailjet::Contactdata.expects(:find).with(mock_contact_id).returns(mock_contactdata)

    mock_contactdata.stubs(:update_attributes).with(data: [{name: 'sign_up_date', value: sign_up_time.to_datetime.rfc3339}, {name: "firstname", value: "Fake Name"}, {name: "display_name", value: "Fake Name"}])

    MailJet.stubs(:subaccount).returns('development')
    MailJet.expects(:add_to_contact_list).with(mock_contact, MailJet::CONTACT_LISTS[:welcome_series][:development][:default])

    MailJet.create_contact_and_add_to_welcome_series(user)
  end

  def test_create_contact_and_add_to_welcome_series_non_en
    email = 'fake.email@test.xx'
    sign_up_time = Time.now.to_datetime

    user = mock
    user.stubs(:id).returns(1)
    user.stubs(:email).returns(email)
    user.stubs(:name).returns('Fake Name')
    user.stubs(:teacher?).returns(true)
    user.stubs(:created_at).returns(sign_up_time)

    mock_contact_id = 123
    mock_contact = mock('Mailjet::Contact')
    mock_contactdata = mock('Mailjet::Contactdata')
    Mailjet::Contactdata.expects(:find).with(mock_contact_id).returns(mock_contactdata)
    mock_contact.stubs(:id).returns(mock_contact_id)

    MailJet.expects(:find_or_create_contact).with(email, user.name).returns(mock_contact)

    mock_contactdata.stubs(:update_attributes).with(data: [{name: 'sign_up_date', value: sign_up_time.to_datetime.rfc3339}, {name: "firstname", value: "Fake Name"}, {name: "display_name", value: "Fake Name"}])

    MailJet.stubs(:subaccount).returns('development')
    MailJet.expects(:add_to_contact_list).with(mock_contact, MailJet::CONTACT_LISTS[:welcome_series][:development][:'es-MX'])

    MailJet.create_contact_and_add_to_welcome_series(user, 'es-MX')
  end

  def test_send_teacher_cap_section_warning
    email = 'fake.email@test.xx'

    sign_up_time = Time.now.to_datetime

    user = mock
    user.stubs(:id).returns(1)
    user.stubs(:email).returns(email)
    user.stubs(:name).returns('Fake Name')
    user.stubs(:teacher?).returns(true)
    user.stubs(:created_at).returns(sign_up_time)

    sections = [
      {'Name' => 'Section 1', 'Link' => 'https://example.com/section1'},
      {'Name' => 'Section 2', 'Link' => 'https://example.com/section2'}
    ]

    mock_contactdata = mock('Mailjet::Contactdata')
    MailJet.expects(:enabled?).returns(true)
    user.expects(:persisted?).returns(true)

    MailJet.expects(:find_or_create_contact).with(email, user.name).returns(mock_contactdata)

    MailJet.expects(:send_template_email).with(mock_contactdata, MailJet::EMAILS[:cap_section_warning], 'en-US', variables: {capSections: sections})

    MailJet.send_teacher_cap_section_warning(user, sections)
  end

  def test_send_teacher_cap_section_warning_to_student
    email = 'fake.email@test.xx'

    sign_up_time = Time.now.to_datetime

    user = mock
    user.stubs(:id).returns(1)
    user.stubs(:email).returns(email)
    user.stubs(:name).returns('Fake Name')
    user.stubs(:teacher?).returns(false)
    user.stubs(:created_at).returns(sign_up_time)

    sections = [
      {'Name' => 'Section 1', 'Link' => 'https://example.com/section1'},
      {'Name' => 'Section 2', 'Link' => 'https://example.com/section2'}
    ]

    MailJet.expects(:enabled?).returns(true)
    user.expects(:persisted?).returns(true)

    assert_raises(ArgumentError, 'the user must be a teacher') do
      MailJet.send_teacher_cap_section_warning(user, sections)
    end
  end

  def test_send_teacher_cap_section_warning_to_non_persisted_user
    email = 'fake.email@test.xx'

    user = mock
    user.stubs(:email).returns(email)
    user.stubs(:name).returns('Fake Name')
    user.stubs(:teacher?).returns(false)

    sections = [
      {'Name' => 'Section 1', 'Link' => 'https://example.com/section1'},
      {'Name' => 'Section 2', 'Link' => 'https://example.com/section2'}
    ]

    MailJet.expects(:enabled?).returns(true)
    user.expects(:persisted?).returns(false)

    assert_raises(ArgumentError, 'the user must be persisted') do
      MailJet.send_teacher_cap_section_warning(user, sections)
    end
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

  def test_add_to_contact_list
    contact = mock('Mailjet::Contact')
    contact.stubs(:id).returns(123)

    list_id = 456

    Mailjet::Listrecipient.expects(:create).with(list_id: list_id, contact_id: 123)

    MailJet.add_to_contact_list(contact, list_id)
  end
end

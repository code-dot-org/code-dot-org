require 'test_helper'

class PersonTest < ActiveSupport::TestCase
  NEW_EMAIL = 'new@example.com'.freeze
  EXISTING_EMAIL = 'existing@example.com'.freeze
  ANOTHER_EMAIL = 'another@example.com'.freeze

  setup do
    @person = create :person
  end

  def test_emails_as_array_when_none
    assert_equal [], @person.emails_as_array
  end

  def test_emails_as_array_when_one
    @person.emails = NEW_EMAIL
    assert_equal [NEW_EMAIL], @person.emails_as_array
  end

  def test_emails_as_array_when_many
    @person.emails = "#{NEW_EMAIL},#{EXISTING_EMAIL},#{ANOTHER_EMAIL}"
    assert_equal [NEW_EMAIL, EXISTING_EMAIL, ANOTHER_EMAIL],
      @person.emails_as_array
  end

  def test_add_email_when_new
    @person.add_email(NEW_EMAIL)
    assert_equal [NEW_EMAIL], @person.emails_as_array
  end

  def test_add_email_when_repeated
    @person.add_email(NEW_EMAIL)
    @person.add_email(NEW_EMAIL)
    assert_equal [NEW_EMAIL], @person.emails_as_array
  end

  def test_add_email_when_existing
    another_person = create :person, emails: EXISTING_EMAIL
    another_user = create :teacher,
      email: EXISTING_EMAIL,
      person_id: another_person.id

    @person.add_email(EXISTING_EMAIL)

    assert_equal [EXISTING_EMAIL], @person.emails_as_array
    assert_equal @person.id, another_user.reload.person_id
    assert_nil Person.find_by_id(another_person.id)
  end

  def test_add_email_when_existing_multiple
    existing_person = create :person, emails: EXISTING_EMAIL
    existing_user = create :teacher,
      email: EXISTING_EMAIL,
      person_id: existing_person.id
    another_user = create :teacher,
      email: ANOTHER_EMAIL,
      person_id: existing_person.id

    @person.add_email(EXISTING_EMAIL)

    assert_equal [EXISTING_EMAIL], @person.emails_as_array
    assert_equal @person.id, existing_user.person_id
    assert_equal @person.id, another_user.person_id
  end
end

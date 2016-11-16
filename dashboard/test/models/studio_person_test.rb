require 'test_helper'

class StudioPersonTest < ActiveSupport::TestCase
  NEW_EMAIL = 'new@example.com'.freeze
  EXISTING_EMAIL = 'existing@example.com'.freeze
  ANOTHER_EMAIL = 'another@example.com'.freeze

  setup do
    @studio_person = create :studio_person
  end

  def test_emails_as_array_when_none
    assert_equal [], @studio_person.emails_as_array
  end

  def test_emails_as_array_when_one
    @studio_person.emails = NEW_EMAIL
    assert_equal [NEW_EMAIL], @studio_person.emails_as_array
  end

  def test_emails_as_array_when_many
    @studio_person.emails = "#{NEW_EMAIL},#{EXISTING_EMAIL},#{ANOTHER_EMAIL}"
    assert_equal [NEW_EMAIL, EXISTING_EMAIL, ANOTHER_EMAIL],
      @studio_person.emails_as_array
  end

  def test_add_email_when_new
    @studio_person.add_email(NEW_EMAIL)
    assert_equal [NEW_EMAIL], @studio_person.emails_as_array
  end

  def test_add_email_when_nonnormalized
    @studio_person.add_email(' ' + NEW_EMAIL.upcase + ' ')
    assert_equal [NEW_EMAIL], @studio_person.emails_as_array
  end

  def test_add_email_when_repeated
    @studio_person.add_email(NEW_EMAIL)
    @studio_person.add_email(NEW_EMAIL)
    assert_equal [NEW_EMAIL], @studio_person.emails_as_array
  end

  def test_add_email_when_existing
    existing_studio_person = create :studio_person, emails: EXISTING_EMAIL
    existing_studio_person_id = existing_studio_person.id
    existing_user = create :teacher,
      email: EXISTING_EMAIL,
      studio_person_id: existing_studio_person.id

    @studio_person.add_email(EXISTING_EMAIL)
    existing_user.reload

    assert_equal [EXISTING_EMAIL], @studio_person.emails_as_array
    assert_equal @studio_person.id, existing_user.studio_person_id
    assert_nil StudioPerson.find_by_id(existing_studio_person_id)
  end

  def test_add_email_when_existing_multiple
    existing_studio_person = create :studio_person, emails: EXISTING_EMAIL
    existing_studio_person_id = existing_studio_person.id
    existing_user = create :teacher,
      email: EXISTING_EMAIL,
      studio_person_id: existing_studio_person.id
    another_user = create :teacher,
      email: ANOTHER_EMAIL,
      studio_person_id: existing_studio_person.id

    @studio_person.add_email(EXISTING_EMAIL)
    existing_user.reload
    another_user.reload

    assert_equal [EXISTING_EMAIL, ANOTHER_EMAIL], @studio_person.emails_as_array
    assert_equal @studio_person.id, existing_user.studio_person_id
    assert_equal @studio_person.id, another_user.studio_person_id
    assert_nil StudioPerson.find_by_id(existing_studio_person_id)
  end

  def test_add_email_with_preexisting_is_preserved
    create :studio_person, emails: EXISTING_EMAIL

    @studio_person.add_email(NEW_EMAIL)
    @studio_person.add_email(EXISTING_EMAIL)

    assert_equal [NEW_EMAIL, EXISTING_EMAIL], @studio_person.emails_as_array
  end
end

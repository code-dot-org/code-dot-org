require_relative '../src/env'
require_relative '../helpers/form_helpers'
require_relative '../src/database'
require_relative 'sequel_test_case'
require 'minitest/autorun'
require 'mocha/mini_test'
require_relative '../src/forms'

DEFAULT_DATA = {
  email_s: 'fake@example.com',
  name_s: 'fake_name',
  organization_name_s: 'fake_org',
  event_type_s: 'in_school',
  hoc_country_s: 'us',
  event_location_s: 'fake_location',
  email_preference_opt_in_s: 'yes'
}.freeze

class FormHelpersTest < SequelTestCase
  describe 'delete_form' do
    DEFAULT_KIND = 'default_kind'.freeze
    DEFAULT_SECRET = 'default_secret'.freeze

    it 'deletes existing form' do
      DB[:forms].insert(
        {
          kind: DEFAULT_KIND,
          secret: DEFAULT_SECRET,
          data: {name: 'fake_name', email: 'fake@example.com'}.to_json,
          email: 'fake@example.com',
          created_at: DateTime.now,
          updated_at: DateTime.now,
          created_ip: '1.2.3.4',
          updated_ip: '1.2.3.4'
        }
      )

      return_value = delete_form DEFAULT_KIND, DEFAULT_SECRET

      assert return_value
      assert_equal 0, DB[:forms].where(kind: DEFAULT_KIND, secret: DEFAULT_SECRET).count
    end

    it 'returns false on bad secret' do
      return_value = delete_form DEFAULT_KIND, 'not_a_secret'

      refute return_value
    end
  end

  describe 'insert_or_upsert_form' do
    before do
      stubs(:dashboard_user).returns(nil)
      Pegasus.stubs(:logger).returns(nil)
      stubs(:request).returns(stub(ip: '1.2.3.4'))
    end

    it 'inserts a new form' do
      row = insert_or_upsert_form(
        'HocSignup2017',
        DEFAULT_DATA.merge(email_s: "#{SecureRandom.hex(8)}@example.com")
      )
      assert row
      assert_equal 1, DB[:forms].where(secret: row[:secret]).count
    end

    it 'creates a forms_geos entry' do
      row = insert_or_upsert_form(
        'HocSignup2017',
        DEFAULT_DATA.merge(email_s: "#{SecureRandom.hex(8)}@example.com")
      )
      assert row
      assert row[:id]
      assert_equal 1, DB[:form_geos].where(form_id: row[:id]).count
    end

    it 'updates an existing HOC signup form' do
      email_s = "#{SecureRandom.hex(8)}@example.com"
      insert_row = insert_or_upsert_form 'HocSignup2017', DEFAULT_DATA.merge(email_s: email_s)
      form_id = insert_row[:id]
      secret = insert_row[:secret]

      insert_or_upsert_form 'HocSignup2017', DEFAULT_DATA.merge(email_s: email_s, hoc_country_s: 'ca')

      updated_form = DB[:forms].where(id: form_id).first
      assert_equal secret, updated_form[:secret]
      updated_data = JSON.parse updated_form[:data]
      assert_equal DEFAULT_DATA[:event_location_s], updated_data['event_location_s']
      assert_equal 'ca', updated_data['hoc_country_s']
    end
  end

  describe 'insert_form_with_large_utf8' do
    before do
      stubs(:dashboard_user).returns(nil)
      Pegasus.stubs(:logger).returns(nil)
      stubs(:request).returns(stub(ip: '1.2.3.4'))
    end

    it 'strips bad utf8 characeters on insert' do
      row = insert_or_upsert_form(
        'HocSignup2017',
        DEFAULT_DATA.merge(email_s: "#{SecureRandom.hex(8)}@example.com", name_s: "Name\u{1F600}Name")
      )
      assert_equal "NameName", row[:name]
    end
  end

  describe 'update_form' do
    before do
      stubs(:dashboard_user).returns(nil)
      Pegasus.stubs(:logger).returns(nil)
      stubs(:request).returns(stub(ip: '1.2.3.4'))
    end

    it 'returns nil if form not found' do
      form = update_form 'HocSignup2017', 'bad_secret', {}
      assert_nil form
    end

    it 'updates form' do
      row = insert_or_upsert_form(
        'HocSignup2017',
        DEFAULT_DATA.merge(email_s: "#{SecureRandom.hex(8)}@example.com")
      )

      form = update_form row[:kind], row[:secret], {"name_s" => 'non_default_name'}
      refute_nil form
      updated_row = DB[:forms].where(kind: row[:kind], secret: row[:secret]).first
      assert_equal 'non_default_name', updated_row[:name]
    end
  end
end

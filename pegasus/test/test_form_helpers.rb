require_relative '../helpers/form_helpers'
require_relative '../src/database'
require_relative 'sequel_test_case'
require 'minitest/autorun'
require 'mocha/mini_test'

class FormHelpersTest < SequelTestCase
  describe 'delete_form' do
    DEFAULT_KIND = 'default_kind'.freeze
    DEFAULT_SECRET = 'default_secret'.freeze

    it 'deletes existing form' do
      # TODO(asher): This does not test SOLR. Fix this.
      DB[:forms].insert(
        {
          kind: DEFAULT_KIND,
          secret: DEFAULT_SECRET,
          data: {name: 'fake_name', email: 'fake@example.com'},
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
      # TODO(asher): This does not test SOLR. Fix this.
      return_value = delete_form DEFAULT_KIND, 'not_a_secret'

      refute return_value
    end
  end

  describe 'insert_form' do
    def default_data
      {
        email_s: 'fake@example.com',
        name_s: 'fake_name',
        organization_name_s: 'fake_org',
        event_type_s: 'in_school',
        hoc_country_s: 'us'
      }
    end

    before do
      stubs(:dashboard_user).returns(nil)
      Pegasus.stubs(:logger).returns(nil)
      stubs(:request).returns(stub(ip: '1.2.3.4'))
    end

    it 'inserts a new form' do
      row = insert_form(
        'HocSignup2017',
        default_data.merge(email: "#{SecureRandom.hex(8)}@example.com")
      )
      assert row
      assert_equal 1, DB[:forms].where(secret: row[:secret]).count
    end

    it 'creates a forms_geos entry' do
      row = insert_form(
        'HocSignup2017',
        default_data.merge(email_s: "#{SecureRandom.hex(8)}@example.com")
      )
      assert row
      assert row[:id]
      assert_equal 1, DB[:form_geos].where(form_id: row[:id]).count
    end

    # TODO(asher): Add additional test to thoroughly test the behavior of insert_form.
  end
end

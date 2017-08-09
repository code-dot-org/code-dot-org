require_relative './test_helper'
require_relative '../helpers/form_helpers'
require_relative '../src/database'
require 'webmock/minitest'

class FormHelpersTest < Minitest::Test
  DEFAULT_KIND = 'default_kind'.freeze
  DEFAULT_SECRET = 'default_secret'.freeze

  def default_params
    time_now = DateTime.now
    {
      kind: DEFAULT_KIND,
      secret: DEFAULT_SECRET,
      data: {name: 'fake_name', email: 'fake@example.com'},
      email: 'fake@example.com',
      created_at: time_now,
      updated_at: time_now,
      created_ip: '1.2.3.4',
      updated_ip: '1.2.3.4'
    }
  end

  def test_delete_form
    # TODO(asher): This does not test SOLR. Fix this.
    DB[:forms].insert default_params

    return_value = delete_form DEFAULT_KIND, DEFAULT_SECRET

    assert return_value
    assert_equal 0, DB[:forms].where(kind: DEFAULT_KIND, secret: DEFAULT_SECRET).count
  end

  def test_delete_form_bad_secret
    # TODO(asher): This does not test SOLR. Fix this.
    return_value = delete_form DEFAULT_KIND, 'not_a_secret'

    refute return_value
  end
end

require_relative '../test_helper'
require 'cdo/parse_email_address_string'

class HashTest < Minitest::Test
  def test_parse_email_address_string
    assert_equal parse_email_address_string("friendly name, phd <email@code.org>"), ""

    assert_equal \
      parse_email_address_string("email@code.org"),
      {name: nil, email: "email@code.org"}

    assert_equal \
      parse_email_address_string("\"friendly name, phd\" <email@code.org>"),
      {name: "\"friendly name, phd\"", email: "email@code.org"}

    assert_equal \
      parse_email_address_string("friendly name <email@code.org>"),
      {name: "friendly name", email: "email@code.org"}

    assert_equal \
      parse_email_address_string("i <3 you <email@code.org>"),
      {name: "i <3 you", email: "email@code.org"}

    assert_equal \
      parse_email_address_string("i <see> you <email@code.org>"),
      {name: "i <see> you", email: "email@code.org"}
  end
end

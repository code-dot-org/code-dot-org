require_relative 'test_helper'
require 'cdo/poste'

class FakeSmtp
  def send_message(message, from_address, *to_addresses)
    @message = message
    @from_address = from_address
    @to_addresses = to_addresses
  end
end

class DelivererTest < Minitest::Test
  def setup
    @fake_smtp = FakeSmtp.new
    Deliverer.any_instance.stubs(:reset_connection).returns(@fake_smtp)
    @deliverer = Deliverer.new({})
  end

  def test_deliverer_render
    template = @deliverer.load_template("dashboard")
    header, html, text = template.render
    assert_equal "Code.org <noreply@code.org>", header["from"]
    refute_nil html
    assert_nil text
  end

  def test_deliverer_send
    email = "test@deliverer.send"
    contact = Poste2.create_recipient(email, {ip_address: '5.6.7.8.'})
    delivery = {
      id: 1,
      contact_id: contact[:id],
      message_id: 3,
      params: {}.to_json
    }
    @deliverer.send(delivery)
    message = @fake_smtp.instance_variable_get(:@message)
    assert_match "To: #{email}", message
    assert_match "<html><body>", message
    assert_equal "noreply@code.org", @fake_smtp.instance_variable_get(:@from_address)
    assert_equal [email], @fake_smtp.instance_variable_get(:@to_addresses)
  end
end

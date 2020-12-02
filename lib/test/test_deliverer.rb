require_relative 'test_helper'
require 'cdo/poste'

class FakeSmtp
  # make these instance variables easily accessible, so we can make assertions
  # about the values passed to send_message
  attr_reader :message, :from_address, :to_addresses

  def send_message(message, from_address, *to_addresses)
    @message = message
    @from_address = from_address
    @to_addresses = to_addresses
  end
end

class DelivererTest < Minitest::Test
  ROOT_DIR = Pathname.new(__dir__) + "../../"
  FIXTURES_DIR = Pathname.new(__dir__) + "fixtures/deliverer/"

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

    # Sequel doesn't have a "find or create by", so we implement it manually
    message = POSTE_DB[:poste_messages].where(name: "dashboard").first
    message_id = message.nil? ? POSTE_DB[:poste_messages].insert({name: "dashboard"}) : message[:id]

    delivery = {
      id: 1,
      contact_id: contact[:id],
      message_id: message_id,
      params: {}.to_json
    }
    @deliverer.send(delivery)
    assert_match "To: #{email}", @fake_smtp.message
    assert_match "<html><body>", @fake_smtp.message
    assert_equal "noreply@code.org", @fake_smtp.from_address
    assert_equal [email], @fake_smtp.to_addresses
  end
end

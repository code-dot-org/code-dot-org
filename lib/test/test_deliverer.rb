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

  # Test all emails against saved fixtures. We expect this test (specifically,
  # the fixtures used by this test) to require an update every time the content
  # of an email template is changed. If this becomes an unwieldy requirement,
  # this test could be simplified to merely verify that the emails render
  # without error.
  #
  # To add fixtures for a new email, you must:
  #
  #   1. Add a params json
  #     - A JSON file containing any params that must be passed to the template
  #     - To the directory lib/test/fixtures/deliverer/params
  #     - With the same name as that of the email template
  #   2. (optionally) Add a forms json
  #     - If the email expects to receive a `form_id` parameter, instead give
  #       it a `form_type`, and create a matching JSON file in
  #       lib/test/fixtures/deliverer/forms containing the `data` and
  #       `processed_data` fields of the form.
  #   3. Add 'expected' fixtures
  #     - In lib/test/fixtures/deliverer/expected, create a directory with the
  #       same name as that of the email template and create the following files
  #       containing the expected content of the rendered email:
  #       - header.yaml
  #       - body.html
  #       - body.txt
  def test_deliverer_render_all
    Dir.each_child(Poste.emails_dir) do |email|
      # skip over 'actionview' templates; those are being used alongside the
      # un-suffixed templates of the same name
      next if email.end_with?("actionview")

      name = File.basename(email, ".*")
      template = @deliverer.load_template(name)

      params_file = FIXTURES_DIR + "params/#{name}.json"
      assert params_file.exist?, "Could not find params for #{name} email test. Please add a #{params_file.relative_path_from(ROOT_DIR)} fixture containing any required parameters for email template."
      params = JSON.parse(File.read(params_file))

      # Simulate the effects of associating a form with an email by putting a
      # "form_kind" entry in the fixture params which references one of our
      # form fixtures.
      if params.key?("form_kind")
        params["form_id"] = get_form_id_from_kind(params.delete("form_kind"))
      end

      header, html, text = template.render(params)
      expected_dir = File.join(FIXTURES_DIR, 'expected', name)

      assert_equal header, YAML.load_file(File.join(expected_dir, 'header.yaml'))
      assert_equal html.to_s, File.read(File.join(expected_dir, 'body.html'))
      assert_equal text.to_s, File.read(File.join(expected_dir, 'body.txt'))
    end
  end

  private

  # Given a "kind" of form, get an id of a form of that kind. If there is no
  # such form currently in the test DB, create one from a fixture.
  def get_form_id_from_kind(kind)
    result = POSTE_DB[:forms].where(kind: kind).first
    return result[:id] unless result.nil?

    form_data = JSON.parse(File.read(FIXTURES_DIR + "forms/#{kind}.json"))
    return PEGASUS_DB[:forms].insert(
      secret: "unique-secret-for-#{kind}",
      kind: kind,
      email: "",
      data: form_data["data"].to_json,
      processed_data: form_data["processed_data"].to_json,
      created_at: Time.parse("2020-02-27 16:50:16 -0800"),
      created_ip: '',
      updated_at: Time.parse("2020-02-27 16:50:16 -0800"),
      updated_ip: ''
    )
  end
end

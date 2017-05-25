require 'test_helper'

class DummyForm < ActiveRecord::Base
  include Pd::Form
end

# create a temporary table for our DummyForm record. Note that because the
# table is temporary, it will be automatically destroyed once the session has
# ended so we don't need to worry about dropping the table in teardown
ActiveRecord::Base.connection.create_table(:dummy_forms, temporary: true) do |t|
  t.string :form_data
end

class DummyFormWithRequiredFields < DummyForm
  def required_fields
    [
      :first_field,
      :second_field
    ].freeze
  end
end

class DummyFormWithOptions < DummyForm
  def self.options
    {
      first_option: ["Yes", "No"],
      second_option: ["I don't know", "Maybe so"]
    }.freeze
  end
end

class Pd::FormTest < ActiveSupport::TestCase
  test 'pd form requires form data' do
    form = DummyForm.new
    assert_equal false,  form.valid?
    assert_equal ["is required"], form.errors.messages[:form_data]
  end

  test 'pd form only validates form data when changed' do
    form = DummyFormWithRequiredFields.new
    form.form_data = {firstField: "foo"}.to_json

    refute form.valid?
    form.save(validate: false)
    assert form.valid?

    form.form_data = {firstField: "bar"}.to_json
    assert_equal false, form.valid?
  end

  test 'pd form enforces required fields' do
    form = DummyFormWithRequiredFields.new

    form.form_data = {}.to_json
    assert_equal false, form.valid?
    assert_equal ["firstField", "secondField"], form.errors.messages[:form_data]

    form.form_data = {firstField: "foo"}.to_json
    assert_equal false, form.valid?
    assert_equal ["secondField"], form.errors.messages[:form_data]

    form.form_data = {firstField: "foo", secondField: "bar"}.to_json
    assert form.valid?
  end

  test 'pd form required fields ignore empty fields' do
    form = DummyFormWithRequiredFields.new

    form.form_data = {firstField: "foo", secondField: ""}.to_json
    assert_equal false, form.valid?
    assert_equal ["secondField"], form.errors.messages[:form_data]
  end

  test 'pd form enforces specific options' do
    form = DummyFormWithOptions.new

    form.form_data = {firstOption: "foo"}.to_json
    assert_equal false,  form.valid?
    assert_equal ["firstOption"], form.errors.messages[:form_data]

    form.form_data = {firstOption: "Yes"}.to_json
    assert_equal true,  form.valid?

    form.form_data = {firstOption: "Yes", secondOption: "Maybe so"}.to_json
    assert form.valid?
  end

  test 'pd form with options allows for multiple inputs' do
    form = DummyFormWithOptions.new

    form.form_data = {firstOption: ["Yes", "foo"], secondOption: "Maybe so"}.to_json
    assert_equal false,  form.valid?
    assert_equal ["firstOption"], form.errors.messages[:form_data]

    form.form_data = {firstOption: ["Yes", "No"], secondOption: "Maybe so"}.to_json
    assert form.valid?
  end
end

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
  def self.required_fields
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

class DummyFormWithRequiredOptions < DummyForm
  def self.options
    {
      first_option: ["Yes", "No"],
      second_option: ["I don't know", "Maybe so"]
    }.freeze
  end

  def self.required_fields
    [
      :first_option,
      :second_option
    ].freeze
  end
end

class DummyFormWithDynamicOptions < DummyForm
  def self.options
    {
      option_set: %w(1 2 3)
    }
  end

  # Valid options depend on which option_set is selected, determined at runtime
  def dynamic_options
    case sanitize_form_data_hash[:option_set]
      when '1'
        {
          option: %w(One Two)
        }
      when '2'
        {
          option: %w(Three Four)
        }
      else
        {
          # always fail in this case
          option: nil
        }
    end
  end
end

class Pd::FormTest < ActiveSupport::TestCase
  test 'pd form requires form data' do
    form = DummyForm.new
    refute form.valid?
    assert_equal ["is required"], form.errors.messages[:form_data]
  end

  test 'pd form only validates form data when changed' do
    form = DummyFormWithRequiredFields.new
    form.form_data = {firstField: "foo"}.to_json

    refute form.valid?
    form.save(validate: false)
    assert form.valid?

    form.form_data = {firstField: "bar"}.to_json
    refute form.valid?
  end

  test 'pd form enforces required fields' do
    form = DummyFormWithRequiredFields.new

    form.form_data = {}.to_json
    refute form.valid?
    assert_equal ["firstField", "secondField"], form.errors.messages[:form_data]

    form.form_data = {firstField: "foo"}.to_json
    refute form.valid?
    assert_equal ["secondField"], form.errors.messages[:form_data]

    form.form_data = {firstField: "foo", secondField: "bar"}.to_json
    assert form.valid?
  end

  test 'pd form required fields ignore empty fields' do
    form = DummyFormWithRequiredFields.new

    form.form_data = {firstField: "foo", secondField: ""}.to_json
    refute form.valid?
    assert_equal ["secondField"], form.errors.messages[:form_data]
  end

  test 'pd form enforces specific options' do
    form = DummyFormWithOptions.new

    form.form_data = {firstOption: "foo"}.to_json
    refute form.valid?
    assert_equal ["firstOption"], form.errors.messages[:form_data]

    form.form_data = {firstOption: "Yes"}.to_json
    assert_equal true, form.valid?

    form.form_data = {firstOption: "Yes", secondOption: "Maybe so"}.to_json
    assert form.valid?
  end

  test 'pd form with options allows for multiple inputs' do
    form = DummyFormWithOptions.new

    form.form_data = {firstOption: ["Yes", "foo"], secondOption: "Maybe so"}.to_json
    refute form.valid?
    assert_equal ["firstOption"], form.errors.messages[:form_data]

    form.form_data = {firstOption: ["Yes", "No"], secondOption: "Maybe so"}.to_json
    assert form.valid?
  end

  test 'pd form with options allows for multiple inputs in hash form' do
    form = DummyFormWithOptions.new

    # Hash keys are ignored. Only the values are used.
    form.form_data = {firstOption: {a1: 'Yes', a2: 'foo'}, secondOption: {a: 'Maybe so'}}.to_json
    refute form.valid?
    assert_equal ['firstOption'], form.errors.messages[:form_data]

    form.form_data = {firstOption: {a1: 'Yes', a2: 'No'}, secondOption: {a: 'Maybe so'}}.to_json
    assert form.valid?
  end

  test 'pd form always fails validation for nil required options' do
    form = DummyFormWithRequiredOptions.new

    form.form_data = {firstOption: 'Yes', secondOption: nil}.to_json
    refute form.valid?
    assert_equal ['secondOption'], form.errors.messages[:form_data]
  end

  test 'pd form passes validation with nil nonrequired options' do
    form = DummyFormWithOptions.new

    form.form_data = {firstOption: 'Yes', secondOption: nil}.to_json
    assert form.valid?
  end

  test 'pd form enforces dynamic options' do
    form = DummyFormWithDynamicOptions.new

    form.form_data = {optionSet: '1', option: 'One'}.to_json
    assert form.valid?

    form.form_data = {optionSet: '2', option: 'One'}.to_json
    refute form.valid?
    assert_equal ['option'], form.errors.messages[:form_data]

    form.form_data = {optionSet: '2', option: 'Four'}.to_json
    assert form.valid?
  end

  test 'clear_form_data clears form data' do
    form = DummyFormWithOptions.new
    form.form_data = {firstOption: ["Yes", "No"], secondOption: "Maybe so"}.to_json

    form.clear_form_data

    assert form.valid?
    assert_equal({}, form.form_data_hash)
  end
end

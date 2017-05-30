require_relative '../test_helper'
require_relative '../../forms/pegasus_form_validation'

# Target class to extend and test form validation methods in a scoped manner
class FormValidationMethods
  extend PegasusFormValidation

  # Delegate to the private class method from PegasusFormValidation,
  # which is available in this class without a caller (as it would appear "globally" in Pegasus)
  def self.method_missing(name, *args)
    raise "#{name} not found in PegasusFormValidation" unless method(name)
    method(name).call(*args)
  end
end

# Empty test form
class TestForm
end

class PegasusFormValidationTest < Minitest::Test
  FIELD_ERROR = FieldError.new 'value', 'message'

  def test_csv_multivalue
    assert_equal %w(one two three), FormValidationMethods.csv_multivalue('one,two,three')
    assert_equal FIELD_ERROR, FormValidationMethods.csv_multivalue(FIELD_ERROR)

    malformed_csv = 'mal, "formed'
    assert_field_error({value: malformed_csv}, FormValidationMethods.csv_multivalue(malformed_csv))
  end

  def test_default_if_empty
    assert_equal 'explicit value', FormValidationMethods.default_if_empty('explicit value', 'default value')
    assert_equal 'default value', FormValidationMethods.default_if_empty('', 'default value')
    assert_equal FIELD_ERROR, FormValidationMethods.default_if_empty(FIELD_ERROR, 'default value')
  end

  def test_downcased
    assert_equal 'downcased', FormValidationMethods.downcased('DownCased')
    assert_equal %w(down cased), FormValidationMethods.downcased(%w(Down Cased))
    assert_equal FIELD_ERROR, FormValidationMethods.downcased(FIELD_ERROR)
  end

  def test_enum
    allowed = %w(one two three)
    assert_equal 'one', FormValidationMethods.enum('one', allowed)
    assert_equal FIELD_ERROR, FormValidationMethods.enum(FIELD_ERROR, allowed)

    assert_field_error({value: 'zero'}, FormValidationMethods.enum('zero', allowed))
  end

  def test_integer
    assert_nil FormValidationMethods.integer('')
    assert_equal 1, FormValidationMethods.integer('1')
    assert_equal 2, FormValidationMethods.integer(' 2 ')
    assert_equal FIELD_ERROR, FormValidationMethods.integer(FIELD_ERROR)

    assert_field_error({value: 'not an integer'}, FormValidationMethods.integer('not an integer'))
  end

  def test_nil_if_empty
    assert_nil FormValidationMethods.nil_if_empty('')
    assert_equal 'not empty', FormValidationMethods.nil_if_empty('not empty')
    assert_equal FIELD_ERROR, FormValidationMethods.nil_if_empty(FIELD_ERROR)
  end

  def test_required
    assert_equal 1, FormValidationMethods.required(1)
    assert_equal 'a string', FormValidationMethods.required('a string')
    assert_equal FIELD_ERROR, FormValidationMethods.required(FIELD_ERROR)

    assert_field_error({value: '', message: :required}, FormValidationMethods.required(''))
  end

  def test_stripped
    assert_equal 'stripped', FormValidationMethods.stripped('  stripped  ')
    assert_equal %w(stripped array), FormValidationMethods.stripped(['  stripped  ', '  array'])
    assert_equal FIELD_ERROR, FormValidationMethods.stripped(FIELD_ERROR)
  end

  def test_uploaded_file
    mock_file = mock
    FormValidationMethods.expects(:open).with('temp-filename').returns(mock_file).once
    AWS::S3.expects(:upload_to_bucket).with('cdo-form-uploads', 's3-filename', mock_file).once
    FormValidationMethods.uploaded_file({filename: 's3-filename', tempfile: 'temp-filename'})

    assert_nil FormValidationMethods.uploaded_file('')
    assert_equal FIELD_ERROR, FormValidationMethods.uploaded_file(FIELD_ERROR)
  end

  def test_email_address
    assert_equal 'person@example.net', FormValidationMethods.email_address('person@example.net')
    assert_equal 'downcased@andstripped.net', FormValidationMethods.email_address('  DownCased@AndStripped.net  ')
    assert_equal FIELD_ERROR, FormValidationMethods.email_address(FIELD_ERROR)

    assert_field_error(
      {value: 'not an email address'},
      FormValidationMethods.email_address('not an email address')
    )
  end

  def test_zip_code
    mock_geocoder_result = mock
    mock_geocoder_result.expects(:postal_code).returns('98101').twice
    Geocoder.expects(:search).with('98101').returns([mock_geocoder_result]).twice

    assert_equal '98101', FormValidationMethods.zip_code('98101')
    assert_equal '98101', FormValidationMethods.zip_code('  98101  ')
    assert_equal FIELD_ERROR, FormValidationMethods.zip_code(FIELD_ERROR)

    Geocoder.expects(:search).with('00000').returns([]).once
    assert_field_error({value: '00000'}, FormValidationMethods.zip_code('00000'))

    Geocoder.expects(:search).with('not a zip code').never
    assert_field_error({value: 'not a zip code'}, FormValidationMethods.zip_code('not a zip code'))
  end

  def test_confirm_match
    assert_equal 'match', FormValidationMethods.confirm_match('match', 'match')
    assert_equal FIELD_ERROR, FormValidationMethods.confirm_match(FIELD_ERROR, 'match')
    assert_field_error(
      {value: 'not a match', message: :mismatch},
      FormValidationMethods.confirm_match('not a match', 'match')
    )
  end

  def test_us_phone_number
    assert_equal '5551112222', FormValidationMethods.us_phone_number('555-111-2222')
    assert_equal '5551112222', FormValidationMethods.us_phone_number('  555-111-2222  ')
    assert_equal FIELD_ERROR, FormValidationMethods.us_phone_number(FIELD_ERROR)
    assert_field_error({value: 'not a phone number'}, FormValidationMethods.us_phone_number('not a phone number'))
  end

  def test_data_to_errors
    data = {
      good_key: 'good value',
      child: {
        good_child_key: 'good child value',
        bad_child_key: FieldError.new('bad child value', :invalid),
        grandchild: {
          bad_grandchild_key: FieldError.new('bad grandchild value', :invalid)
        }
      },
      bad_key: FieldError.new('bad value', :invalid),
      mismatched_key: FieldError.new('mismatched value', :mismatch)
    }

    expected_errors = {
      'child[bad_child_key]': [:invalid],
      'child[grandchild[bad_grandchild_key]]': [:invalid],
      bad_key: [:invalid],
      mismatched_key: [:mismatch]
    }

    assert_equal expected_errors, FormValidationMethods.data_to_errors(data)
  end

  def test_validate_form
    mock_good_data = mock
    mock_normalized_data = mock
    TestForm.expects(:normalize).with(mock_good_data).returns(mock_normalized_data)
    FormValidationMethods.expects(:data_to_errors).with(mock_normalized_data).returns({})
    assert_equal mock_normalized_data, FormValidationMethods.validate_form('TestForm', mock_good_data)

    mock_bad_data = mock
    mock_normalized_with_error_data = mock
    TestForm.expects(:normalize).with(mock_bad_data).returns(mock_normalized_with_error_data)
    FormValidationMethods.expects(:data_to_errors).with(mock_normalized_with_error_data).returns({key: ['error']})
    e = assert_raises FormError do
      FormValidationMethods.validate_form('TestForm', mock_bad_data)
    end
    assert_equal({key: ['error']}, e.errors)
  end

  private

  def assert_field_error(error_params, error)
    assert_instance_of FieldError, error
    assert_equal error_params[:value], error.value
    assert_equal error_params[:message] || :invalid, error.message
    error
  end
end

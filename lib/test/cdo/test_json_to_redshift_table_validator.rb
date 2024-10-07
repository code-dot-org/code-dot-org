require_relative '../test_helper'
require 'json'
require 'cdo/json_to_redshift_table_validator'
require 'active_support'
require 'active_support/core_ext/string/multibyte'

class JSONtoRedshiftTableValidatorTest < Minitest::Test
  def setup
    @schema = {
      type: "redshift_table",
      columns: {
        created_at: {
          type: "timestamp without time zone",
          nullable: false
        },
        environment: {
          type: "character",
          maxLength: 128,
          nullable: false
        },
        study: {
          type: "character",
          maxLength: 128,
          nullable: false
        },
        study_group: {
          type: "character",
          maxLength: 128
        },
        device: {
          type: "character",
          maxLength: 1024
        },
        uuid: {
          type: "character",
          maxLength: 128
        },
        user_id: {
          type: "integer"
        },
        script_id: {
          type: "integer"
        },
        level_id: {
          type: "integer"
        },
        project_id: {
          type: "character",
          maxLength: 128
        },
        event: {
          type: "character",
          maxLength: 128,
          nullable: false
        },
        data_int: {
          type: "integer"
        },
        data_float: {
          type: "double precision"
        },
        data_string: {
          type: "character",
          maxLength: 4096
        },
        data_json: {
          type: "character varying",
          maxLength: 65535
        }
      }
    }
  end

  def test_valid_record
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login"
    }.to_json
    validated_record_string, validation_errors = Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema)
    assert_equal validated_record_string, record_string
    assert_empty validation_errors
  end

  def test_wrong_datatype
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "user_id" => "not_an_integer"
    }.to_json
    assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema)
    end
  end

  def test_compatible_datatype_is_valid_and_converted
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "project_id" => 8_675_309 # project_id is a `character` column but Integer can be safely cast to String
    }.to_json
    validated_record_string, validation_errors = Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema, modify_invalid: true)
    assert_empty validation_errors
    validated_record = JSON.parse(validated_record_string)  # Reparse result to check.
    assert_equal "8675309", validated_record["project_id"]
  end

  def test_exceeds_max_length
    json_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_string" => "a" * 5000
    }.to_json
    assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(json_string, @schema)
    end
  end

  def test_missing_required_property
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study"
      # "event" is missing
    }.to_json
    assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema)
    end
  end

  def test_required_property_is_empty
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => ""
    }.to_json
    assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema)
    end
  end

  def test_truncate_when_modify_invalid_true
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_string" => "a" * 5000
    }.to_json
    validated_record_string, validation_errors = Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema, modify_invalid: true)
    refute_empty validation_errors
    validated_record = JSON.parse(validated_record_string)  # Reparse result to check.
    assert_equal 4096, validated_record["data_string"].length
  end

  def test_no_truncate_when_modify_invalid_false
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_string" => "a" * 5000
    }.to_json
    assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema, modify_invalid: false)
    end
  end

  def test_multiple_errors
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "user_id" => "not_an_integer",
      "data_string" => "a" * 5000
    }.to_json
    error = assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema)
    end
    assert_includes error.message, "Not an integer for `user_id`: `not_an_integer`."
    assert_includes error.message, "Value too long for `data_string`"
  end

  def test_complex_object_truncation
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_json" => {"key" => "a" * 70000}
    }.to_json
    validated_record_string, validation_errors = Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema, modify_invalid: true)
    refute_empty validation_errors
    validated_record = JSON.parse(validated_record_string)  # Reparse result
    assert validated_record["data_json"].is_a?(String)
    assert_operator ActiveSupport::Multibyte::Chars.new(validated_record["data_json"]).bytes.size, :<=, 65535
  end

  def test_complex_object_is_converted_to_string
    nested_object = {"key" => "a"}
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_json" => nested_object
    }.to_json
    validated_record_string, validation_errors = Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema, modify_invalid: true)
    assert_empty validation_errors
    validated_record = JSON.parse(validated_record_string)  # Reparse result
    assert validated_record["data_json"].is_a?(String)
    assert_equal nested_object.to_json, validated_record["data_json"]
  end

  def test_non_ascii_character_in_character_column
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "project_id" => "project123\u00A9"  # Copyright symbol (non-ASCII)
    }.to_json

    error = assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema)
    end
    assert_includes error.message, "Invalid character(s) in CHAR column `project_id`: contains non-ASCII characters"
  end

  def test_non_ascii_character_in_character_column_with_modify_invalid
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "project_id" => "project123\u00A9"  # Copyright symbol (non-ASCII)
    }.to_json

    validated_record_string, validation_errors = Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema, modify_invalid: true)
    refute_empty validation_errors
    validated_record = JSON.parse(validated_record_string)
    assert_equal "project123?", validated_record["project_id"]
  end

  def test_valid_utf8_in_character_varying_column
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_json" => "Valid UTF-8 \u00A9\u20AC"  # Copyright and Euro symbols
    }.to_json

    result, validation_errors = Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema)
    assert_empty validation_errors
    parsed_result = JSON.parse(result)
    assert_equal "Valid UTF-8 ©€", parsed_result["data_json"]
  end

  def test_multibyte_characters_exceeding_column_size
    # Update the schema to include a short varying character field
    @schema[:columns][:short_text] = {
      type: "character varying",
      maxLength: 10  # 10 bytes
    }

    # Create a string with 5 characters, but more than 10 bytes
    multibyte_string = "あいうえお"  # 5 Japanese characters, each 3 bytes in UTF-8

    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "short_text" => multibyte_string
    }.to_json

    error = assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema)
    end
    assert_includes error.message, "Value too long for `short_text`: 15 bytes (max 10)"
  end

  def test_multibyte_characters_exceeding_column_size_with_modify_invalid
    # Ensure the schema includes the short varying character field
    @schema[:columns][:short_text] = {
      type: "character varying",
      maxLength: 10  # 10 bytes
    }

    # Create a string with 5 characters, but more than 10 bytes
    multibyte_string = "あいうえお"  # 5 Japanese characters, each 3 bytes in UTF-8

    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "short_text" => multibyte_string
    }.to_json

    validated_record_string, validation_errors = Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema, modify_invalid: true)
    refute_empty validation_errors

    validated_record = JSON.parse(validated_record_string)
    assert_equal "あいう", validated_record["short_text"]  # Should be truncated to fit within 10 bytes
    assert validated_record["short_text"].bytesize <= 10
  end
end

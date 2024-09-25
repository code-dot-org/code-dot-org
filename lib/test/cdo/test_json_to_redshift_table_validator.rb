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
    validated_record_string, modified = Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema)
    assert_equal validated_record_string, record_string
    refute modified
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

  def test_truncate_when_modify_invalid_true
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_string" => "a" * 5000
    }.to_json
    result, modified = Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema, modify_invalid: true)
    assert modified
    parsed_result = JSON.parse(result)  # Reparse result to check.
    assert_equal 4096, parsed_result["data_string"].length
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
    assert_includes error.message, "Not an integer for user_id: not_an_integer."
    assert_includes error.message, "Value too long for data_string"
  end

  def test_complex_object_truncation
    record_string = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_json" => {"key" => "a" * 70000}
    }.to_json
    validated_record_string, modified = Cdo::JSONtoRedshiftTableValidator.validate(record_string, @schema, modify_invalid: true)
    assert modified
    validated_record = JSON.parse(validated_record_string)  # Reparse result
    assert validated_record["data_json"].is_a?(String)
    assert_operator ActiveSupport::Multibyte::Chars.new(validated_record["data_json"]).bytes.size, :<=, 65535
  end
end

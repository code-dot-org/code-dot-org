require_relative '../test_helper'
require 'json'
require 'cdo/json_to_redshift_table_validator'

class JSONtoRedshiftTableValidatorTest < Minitest::Test
  def setup
    @schema = {
      "type" => "object",
      "properties" => {
        "created_at" => {
          "type" => "string",
          "format" => "date-time"
        },
        "environment" => {
          "type" => "string",
          "maxLength" => 128
        },
        "study" => {
          "type" => "string",
          "maxLength" => 128
        },
        "study_group" => {
          "type" => ["string", "object", "null"],
          "maxLength" => 128
        },
        "device" => {
          "type" => ["string", "object", "null"],
          "maxLength" => 1024
        },
        "uuid" => {
          "type" => ["string", "null"],
          "maxLength" => 128
        },
        "user_id" => {
          "type" => ["integer", "null"]
        },
        "script_id" => {
          "type" => ["integer", "null"]
        },
        "level_id" => {
          "type" => ["integer", "null"]
        },
        "project_id" => {
          "type" => ["string", "integer", "null"],
          "maxLength" => 128
        },
        "event" => {
          "type" => ["string", "object", "null"],
          "maxLength" => 128
        },
        "data_int" => {
          "type" => ["integer", "null"]
        },
        "data_float" => {
          "type" => ["number", "null"]
        },
        "data_string" => {
          "type" => ["string", "null"],
          "maxLength" => 4096
        },
        "data_json" => {
          "type" => ["string", "object", "null"],
          "maxLength" => 65535
        }
      },
      "required" => ["created_at", "environment", "study", "event"]
    }
  end

  def test_valid_json
    json = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login"
    }
    result, modified = Cdo::JSONtoRedshiftTableValidator.validate(json, @schema)
    assert_equal json, result
    refute modified
  end

  def test_wrong_datatype
    json = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "user_id" => "not_an_integer"
    }
    assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(json, @schema)
    end
  end

  def test_exceeds_max_length
    json = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_string" => "a" * 5000
    }
    assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(json, @schema)
    end
  end

  def test_missing_required_property
    json = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study"
      # "event" is missing
    }
    assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(json, @schema)
    end
  end

  def test_truncate_when_modify_invalid_true
    json = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_string" => "a" * 5000
    }
    result, modified = Cdo::JSONtoRedshiftTableValidator.validate(json, @schema, modify_invalid: true)
    assert modified
    assert_equal 4096, result["data_string"].length
  end

  def test_no_truncate_when_modify_invalid_false
    json = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_string" => "a" * 5000
    }
    assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(json, @schema, modify_invalid: false)
    end
  end

  def test_multiple_errors
    json = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "user_id" => "not_an_integer",
      "data_string" => "a" * 5000
    }
    error = assert_raises(Cdo::JSONtoRedshiftTableValidator::ValidationError) do
      Cdo::JSONtoRedshiftTableValidator.validate(json, @schema)
    end
    assert_includes error.message, "Invalid type for Redshift column user_id"
    assert_includes error.message, "Redshift column data_string exceeds maximum byte length"
  end

  def test_complex_object_truncation
    json = {
      "created_at" => "2023-09-03T12:00:00Z",
      "environment" => "production",
      "study" => "example_study",
      "event" => "login",
      "data_json" => {"key" => "a" * 70000}
    }
    result, modified = Cdo::JSONtoRedshiftTableValidator.validate(json, @schema, modify_invalid: true)
    assert modified
    # Since the destination is a Redshift table and each top level Property of the JSON object maps to a destination
    # column, top level Properties that have complex types are converted to string.
    assert result["data_json"].is_a?(String)
    assert_operator result["data_json"].bytesize, :<=, 65535
  end
end

require 'test_helper'

class SeededS3ObjectTest < ActiveSupport::TestCase
  test "Basic SeededS3Object creation succeeds" do
    seeded_object = build :seeded_s3_object
    assert seeded_object.valid?, seeded_object.errors.full_messages
  end
end

require_relative 'test_helper'
require 'helpers/table_coerce'

class TablesTest < Minitest::Test
  include SetupTest

  def test_boolean
    assert_equal true, TableCoerce.boolean?(true)
    assert_equal true, TableCoerce.boolean?(false)
    assert_equal true, TableCoerce.boolean?("false")
    assert_equal true, TableCoerce.boolean?("true")
    assert_equal true, TableCoerce.boolean?("False")
    assert_equal true, TableCoerce.boolean?("True")

    assert_equal false, TableCoerce.boolean?("NotTrue")
    assert_equal false, TableCoerce.boolean?("asdf")
    assert_equal false, TableCoerce.boolean?("1.23")
    assert_equal false, TableCoerce.boolean?("1,000")
    assert_equal false, TableCoerce.boolean?(0)
    assert_equal false, TableCoerce.boolean?(1)
    assert_equal false, TableCoerce.boolean?(1.23)
  end

  def test_to_boolean
    assert_equal true, TableCoerce.to_boolean(true)
    assert_equal false, TableCoerce.to_boolean(false)
    assert_equal false, TableCoerce.to_boolean("false")
    assert_equal true, TableCoerce.to_boolean("true")
    assert_equal false, TableCoerce.to_boolean("False")
    assert_equal true, TableCoerce.to_boolean("True")

    [3, 'asdf', 'NotTrue'].each do |val|
      assert_raises 'Cannot coerce to boolean' do
        TableCoerce.to_boolean(val)
      end
    end
  end

  def test_number
    assert_equal true, TableCoerce.number?(0)
    assert_equal true, TableCoerce.number?(1)
    assert_equal true, TableCoerce.number?(1.23)
    assert_equal true, TableCoerce.number?(1000)

    assert_equal true, TableCoerce.number?("0")
    assert_equal true, TableCoerce.number?("1")
    assert_equal true, TableCoerce.number?("1.23")
    assert_equal true, TableCoerce.number?("1000")
    # assert_equal true, TableCoerce.number?("1,000")

    assert_equal false, TableCoerce.number?("asdf")
    assert_equal false, TableCoerce.number?("true")
    assert_equal false, TableCoerce.number?("false")
    assert_equal false, TableCoerce.number?(true)
    assert_equal false, TableCoerce.number?(false)
    assert_equal false, TableCoerce.number?("123asdf")
  end

  def test_to_number
    assert_equal 0, TableCoerce.to_number(0)
    assert_equal 1, TableCoerce.to_number(1)
    assert_equal 1.23, TableCoerce.to_number(1.23)
    assert_equal 1000, TableCoerce.to_number(1000)

    assert_equal 0, TableCoerce.to_number("0")
    assert_equal 1, TableCoerce.to_number("1")
    assert_equal 1.23, TableCoerce.to_number("1.23")
    assert_equal 1000, TableCoerce.to_number("1000")
    # assert_equal 1000, TableCoerce.to_number("1,000")

    ["asdf", "true", "false", true, false, "123asdf"].each do |val|
      assert_raises 'Cannot coerce to number' do
        TableCoerce.to_number(val)
      end
    end
  end

  def test_column_types
    columns = ['all_numbers', 'all_bools', 'all_strings', 'bools_and_nums', 'bools_and_strings', 'nums_and_bools']
    records = [
      { "all_numbers" => "1", "all_bools" => 'true', "all_strings" => 'hello', "bools_and_nums" => 'true', "bools_and_strings" => 'false', "nums_and_bools" => '3' },
      { "all_numbers" => "2", "all_bools" => 'false', "all_strings" => 'world', "bools_and_nums" => '2', "bools_and_strings" => 'ruby', "nums_and_bools" => 'true' }
    ]
    expected = [:number, :boolean, :string, :string, :string, :string]

    assert_equal expected, TableCoerce.column_types(records, columns)
  end

  def test_coerce
    columns = ['all_numbers', 'all_bools', 'mixed']
    records = [
      { "all_numbers" => "1", "all_bools" => "true", "mixed" => "true" },
      { "all_numbers" => "2", "all_bools" => "false", "mixed" => "1" },
      { "all_numbers" => "3", "all_bools" => "true", "mixed" => "asdf" },
    ]

    expected = [
      { "all_numbers" => 1, "all_bools" => true, "mixed" => "true" },
      { "all_numbers" => 2, "all_bools" => false, "mixed" => "1" },
      { "all_numbers" => 3, "all_bools" => true, "mixed" => "asdf" },
    ]
    assert_equal expected, TableCoerce.coerce_columns_from_data(records, columns)
  end

  def test_column_coerce
    records = [
      { "all_numbers" => "1", "all_bools" => "true", "mixed" => "true" },
      { "all_numbers" => "2", "all_bools" => "false", "mixed" => "1" },
      { "all_numbers" => "3", "all_bools" => "true", "mixed" => "asdf" },
    ]

    # coerce all_bools to bools
    records, all_converted = TableCoerce.coerce_column(records, 'all_bools', :boolean)
    expected = [
      { "all_numbers" => "1", "all_bools" => true, "mixed" => "true" },
      { "all_numbers" => "2", "all_bools" => false, "mixed" => "1" },
      { "all_numbers" => "3", "all_bools" => true, "mixed" => "asdf" }
    ]
    assert_equal expected, records
    assert_equal true, all_converted

    # now convert back to strings
    records, all_converted = TableCoerce.coerce_column(records, 'all_bools', :string)
    expected = [
      { "all_numbers" => "1", "all_bools" => "true", "mixed" => "true" },
      { "all_numbers" => "2", "all_bools" => "false", "mixed" => "1" },
      { "all_numbers" => "3", "all_bools" => "true", "mixed" => "asdf" }
    ]
    assert_equal expected, records
    assert_equal true, all_converted

    # convert mixed to numbers, only one should be converted
    records, all_converted = TableCoerce.coerce_column(records, 'mixed', :number)
    expected = [
      { "all_numbers" => "1", "all_bools" => "true", "mixed" => "true" },
      { "all_numbers" => "2", "all_bools" => "false", "mixed" => 1 },
      { "all_numbers" => "3", "all_bools" => "true", "mixed" => "asdf" }
    ]
    assert_equal expected, records
    assert_equal false, all_converted

  end
end

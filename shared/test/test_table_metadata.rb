require_relative 'test_helper'
require 'helpers/table_metadata'

class TablesTest < Minitest::Test
  include SetupTest

  def test_generate_column_info
    records = [
      { "col1" => 1, "col2" => 2 }
    ]
    expected = ["col1", "col2"]
    assert_equal expected, TableMetadata.generate_column_info(records)

    records = [
      { "col1" => 1, "col2" => 2 },
      { "col2" => 3, "col3" => 4 }
    ]
    expected = ["col1", "col2", "col3"]
    assert_equal expected, TableMetadata.generate_column_info(records)

    records = []
    expected = []
    assert_equal expected, TableMetadata.generate_column_info(records)
  end

  def test_remove_column
    column_list = ["col1", "col2", "col3"]

    assert_equal ["col1", "col2"], TableMetadata.remove_column(column_list, "col3")
    assert_equal ["col1", "col3"], TableMetadata.remove_column(column_list, "col2")
    assert_equal ["col2", "col3"], TableMetadata.remove_column(column_list, "col1")

    assert_raises 'No such column' do
      TableMetadata.remove_column(column_list, "col4")
    end

    assert_raises 'No such column' do
      TableMetadata.remove_column([], "col4")
    end
  end

  def test_add_column
    column_list = ["col1", "col2"]

    assert_equal ["col1", "col2", "col3"], TableMetadata.add_column(column_list, "col3")

    assert_raises 'Column already exists' do
      TableMetadata.add_column(column_list, "col1")
    end

    assert_raises 'Column already exists' do
      TableMetadata.add_column(column_list, "col2")
    end
  end
end

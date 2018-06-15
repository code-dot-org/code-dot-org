require 'test_helper'

class SharedBlocklyFunctionTest < ActiveSupport::TestCase
  teardown do
    FileUtils.rm_rf "config/shared_functions/fakeLevelType"
  end

  test 'Function writes to and loads back from file' do
    function = create :shared_blockly_function
    xml_before = function.file_content
    function.delete
    SharedBlocklyFunction.load_records

    seeded_function = SharedBlocklyFunction.find_by(name: function.name)

    assert_equal xml_before, seeded_function.file_content

    seeded_function.destroy
  end

  test 'Function deletes file after being destroyed' do
    function = create :shared_blockly_function
    assert File.exist? "config/shared_functions/fakeLevelType/#{function.name}.xml"
    function.destroy
    refute File.exist? "config/shared_functions/fakeLevelType/#{function.name}.xml"
    assert_empty Dir.glob("config/shared_functions/fakeLevelType/*")
  end
end

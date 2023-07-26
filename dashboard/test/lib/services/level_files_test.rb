require 'test_helper'

module Services
  class LevelFilesTest < ActiveSupport::TestCase
    test 'converts from and to XML level format' do
      name = 'Test level convert'
      level = Services::LevelFiles.load_custom_level_xml(File.read(File.join(self.class.fixture_path, 'test_level.xml')), Level.new(name: name))
      xml = level.to_xml
      xml2 = Services::LevelFiles.load_custom_level_xml(xml, Level.new(name: name.next)).to_xml
      level.destroy
      assert_equal xml, xml2
    end

    test 'debugging info for exceptions in load_custom_level' do
      Services::LevelFiles.send(:load_custom_level, 'xxxxx', {})
    rescue Exception => exception
      assert_includes exception.message, "in level"
    end
  end
end

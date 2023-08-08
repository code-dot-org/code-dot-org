require 'test_helper'

module Services
  class LevelFilesTest < ActiveSupport::TestCase
    test 'can write custom level file' do
      Policies::LevelFiles.stubs(:write_to_file?).returns(true)
      level = build(:maze, name: "Testing Level File Writing", published: true)
      File.expects(:write).with do |path, _data|
        assert_equal path, Rails.root.join("config/scripts/levels/maze/Testing Level File Writing.level")
      end
      Services::LevelFiles.write_custom_level_file(level)
    end

    test 'can delete custom level file' do
      Policies::LevelFiles.stubs(:write_to_file?).returns(true)
      level = create(:level, name: "Testing Level File Writing")

      # There are a couple of different places level files can end up, and we want
      # to check all of them.
      level_files = [
        # Check at the root of the levels directory
        "config/scripts/levels/#{level.name}.level",
        # Check nested and deeply-nested subdirectories of the levels directory
        "config/scripts/levels/foo/#{level.name}.level",
        "config/scripts/levels/foo/bar/baz/qux/#{level.name}.level",
      ]

      level_files.each do |level_file|
        full_level_file_path = Rails.root.join(level_file)
        FileUtils.mkdir_p(File.dirname(full_level_file_path))
        FileUtils.touch(full_level_file_path)
        assert File.exist?(full_level_file_path)
        Services::LevelFiles.delete_custom_level_file(level)
        refute File.exist?(full_level_file_path)
      end
    ensure
      # Make sure we clean up all touched level files, even if the test fails
      level_files.each {|level_file| FileUtils.rm_f(level_file)}
    end

    test 'converts from and to XML level format' do
      name = 'Test level convert'
      level = Services::LevelFiles.load_custom_level_xml(File.read(File.join(self.class.fixture_path, 'test_level.xml')), Level.new(name: name))
      xml = level.to_xml
      xml2 = Services::LevelFiles.load_custom_level_xml(xml, Level.new(name: name.next)).to_xml
      level.destroy
      assert_equal xml, xml2
    end

    test 'deletes removed level properties on import' do
      level = create(:level, long_instructions: 'foo', short_instructions: 'bar')
      assert_equal level.long_instructions, 'foo'
      assert_equal level.short_instructions, 'bar'

      new_xml = <<~XML
        <Blockly>
          <config><![CDATA[{
            "level_num": "custom",
            "properties": {
              "long_instructions": "baz"
            }
          }]]></config>
          <blocks/>
        </Blockly>
      XML
      Services::LevelFiles.load_custom_level_xml(new_xml, level)

      assert_equal level.long_instructions, 'baz'
      assert_nil level.short_instructions
    end

    test 'debugging info for exceptions in load_custom_level' do
      Services::LevelFiles.send(:load_custom_level, 'xxxxx', {})
    rescue Exception => exception
      assert_includes exception.message, "in level"
    end
  end
end

require_relative '../test_helper'
require 'cdo/test_run_utils'
require 'fileutils'
require 'tmpdir'

class TestRunUtilsTest < Minitest::Test
  describe 'DASHBOARD_SEED_INPUTS' do
    # A pattern that stops matching drops out of the hash without an error.
    it 'matches a file for every pattern' do
      unmatched = TestRunUtils::DASHBOARD_SEED_INPUTS.select do |pattern|
        Dir.glob(pattern, base: dashboard_dir).none? {|path| File.file?(dashboard_dir(path))}
      end

      assert_empty unmatched
    end
  end

  describe 'dashboard_seed_hash' do
    before do
      @root = Dir.mktmpdir
      write 'config/videos.csv', 'Key'
    end

    after do
      FileUtils.remove_entry @root
    end

    def write(path, content)
      FileUtils.mkdir_p File.dirname(File.join(@root, path))
      File.write File.join(@root, path), content
    end

    def seed_hash
      TestRunUtils.dashboard_seed_hash(@root)
    end

    it 'changes when an input is edited' do
      before_hash = seed_hash
      write 'config/videos.csv', 'Key,Name'

      refute_equal before_hash, seed_hash
    end
  end
end

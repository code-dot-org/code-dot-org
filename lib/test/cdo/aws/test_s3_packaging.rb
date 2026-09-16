require_relative '../../test_helper'
require 'cdo/aws/s3_packaging'
require 'cdo/rake_utils'

# Covers the parts of S3Packaging that touch the file system. Nothing here
# talks to S3.
class S3PackagingTest < Minitest::Test
  COMMIT_HASH = 'testcommithash'.freeze

  def setup
    RakeUtils.stubs(:git_folder_hash).returns(COMMIT_HASH)
    @root = Dir.mktmpdir
    @build_dir = File.join(@root, 'build')
    @target = File.join(@root, 'target')
    @packager = S3Packaging.new('test', @root, [@root], @target)
  end

  def teardown
    FileUtils.remove_entry(@root)
  end

  def test_create_package_includes_only_the_named_dotfiles
    write_build_files(
      'index.html' => 'page',
      '.vite/manifest.json' => '{}',
      '.secret' => 'do not ship'
    )

    package = @packager.create_package('/build', extra_paths: ['.vite'])

    assert_equal ['.vite/manifest.json', 'commit_hash', 'index.html'], package_contents(package)
  end

  def test_create_package_skips_dotfiles_by_default
    write_build_files('index.html' => 'page', '.vite/manifest.json' => '{}')

    package = @packager.create_package('/build')

    assert_equal ['commit_hash', 'index.html'], package_contents(package)
  end

  def test_create_package_rejects_a_changed_commit_hash
    write_build_files('index.html' => 'page')

    error = assert_raises(RuntimeError) do
      @packager.create_package('/build', expected_commit_hash: 'someotherhash')
    end
    assert_includes error.message, 'contents changed unexpectedly'
  end

  def test_decompress_package_clears_the_previous_contents
    write_build_files('index.html' => 'page', '.vite/manifest.json' => '{}')
    package = @packager.create_package('/build', extra_paths: ['.vite'])

    FileUtils.mkdir_p(File.join(@target, '.vite'))
    File.write(File.join(@target, 'stale.js'), 'old')
    File.write(File.join(@target, '.vite/manifest.json'), 'stale manifest')

    @packager.decompress_package(package)

    refute_path_exists File.join(@target, 'stale.js')
    assert_equal '{}', File.read(File.join(@target, '.vite/manifest.json'))
    assert_equal COMMIT_HASH, File.read(File.join(@target, 'commit_hash'))
  end

  private def write_build_files(files)
    files.each do |path, contents|
      full_path = File.join(@build_dir, path)
      FileUtils.mkdir_p(File.dirname(full_path))
      File.write(full_path, contents)
    end
  end

  private def package_contents(package)
    `tar -tzf #{package.path}`.split("\n").reject {|entry| entry.end_with?('/')}.sort
  end
end

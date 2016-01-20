require 'minitest/autorun'
require 'rack/test'

require_relative '../../lib/cdo/aws/s3_packaging'
require_relative '../../deployment'

ORIGINAL_HASH = 'fake-hash'

class RakeUtils
  def self.git_latest_commit_hash(_)
    ''
  end
end

class S3PackagingTest < Minitest::Test
  def create_packager(commit_hash = ORIGINAL_HASH)
    source_location = Dir.mktmpdir
    target_location = Dir.mktmpdir
    Dir.chdir(source_location) do
      FileUtils.mkdir('src')
      File.open('src/one.js', 'w') { |file| file.write("file one") }
      File.open('src/two.js', 'w') { |file| file.write("file two") }
      FileUtils.mkdir('build')
      File.open('build/output.js', 'w') { |file| file.write("output") }
    end
    packager = RakeUtils.stub(:git_latest_commit_hash, commit_hash) do
      S3Packaging.new('test-package', source_location, target_location)
    end
    [source_location, target_location, packager]
  end

  def cleanup_packager(source_location, target_location)
    FileUtils.remove_entry_secure source_location
    FileUtils.remove_entry_secure target_location
  end

  def setup
    @source_location, @target_location, @packager = create_packager
  end

  def teardown
    cleanup_packager(@source_location, @target_location)
  end

  def test_s3_key
    s3_key = @packager.send(:s3_key)
    assert_equal s3_key, 'test-package/fake-hash.tar.gz'
  end

  def test_create_and_decompress_package
    package = @packager.send(:create_package, 'build')
    assert package.is_a?(Tempfile)

    `rm -rf #{@target_location}/*`
    @packager.send(:decompress_package, package)

    # package contains a commit_hash
    commit_hash_file = @target_location + '/commit_hash'
    assert File.exist?(commit_hash_file)
    assert_equal IO.read(commit_hash_file), ORIGINAL_HASH

    assert File.exist?(@target_location + '/output.js')
  end

  def test_upload_download_package
    package = @packager.send(:create_package, 'build')

    @packager.send(:upload_package, package)

    downloaded = @packager.send(:download_package)
    assert FileUtils.compare_file(package, downloaded)
  end

  def test_download_nonexistent
    @packager.instance_variable_set(:@commit_hash, 'fake-nonexistent-hash')
    threw = false
    begin
      @packager.send(:download_package)
    rescue Aws::S3::Errors::NoSuchKey
      threw = true
    end
    assert threw

    @packager.instance_variable_set(:@commit_hash, ORIGINAL_HASH)
  end

  def test_ensure_updated_package

  end

end

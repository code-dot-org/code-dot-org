require_relative '../../test_helper'
require 'cdo/aws/turbo_s3_packaging'
require 'cdo/rake_utils'

# Covers pointer resolution and generational retention. Packages are built and
# unpacked for real in a tmpdir; S3 is stubbed by the AWS SDK.
class TurboS3PackagingTest < Minitest::Test
  GIT_HASH = 'frontendgithash'.freeze
  POINTER_KEY = "studio/pointer-#{GIT_HASH}".freeze

  def setup
    RakeUtils.stubs(:git_folder_hash).returns(GIT_HASH)
    @s3 = Aws::S3::Client.new(stub_responses: true)
    Aws::S3::Client.stubs(:new).returns(@s3)
    @root = Dir.mktmpdir
    @dist = File.join(@root, 'dist')
    @target = File.join(@root, 'target')
  end

  def teardown
    FileUtils.remove_entry(@root)
  end

  def test_upload_pointer_records_the_package_key_for_this_git_tree
    packager('turbohash1').upload_pointer

    request = @s3.api_requests.last
    assert_equal :put_object, request[:operation_name]
    assert_equal POINTER_KEY, request[:params][:key]
    assert_equal 'turbohash1', request[:params][:body]
    assert_equal 'public-read', request[:params][:acl]
  end

  def test_pointer_mode_reads_the_package_key_from_s3
    @s3.stub_responses(:get_object, {body: "turbohash1\n"})

    packager = packager('unused', resolve_from_pointer: true)

    assert_equal 'turbohash1', packager.commit_hash
    assert_equal POINTER_KEY, @s3.api_requests.last[:params][:key]
  end

  def test_pointer_mode_names_the_remedy_when_the_pointer_is_missing
    TurboS3Packaging.any_instance.stubs(:download_object).
      raises(Aws::S3::Errors::NoSuchKey.new(nil, 'missing'))

    error = assert_raises(RuntimeError) {packager('unused', resolve_from_pointer: true)}

    assert_includes error.message, POINTER_KEY
    assert_includes error.message, 'Build this commit on a build environment'
  end

  def test_the_newest_two_generations_survive_and_older_ones_are_pruned
    deploy('gen1', 'assets/app-1.js' => 'one')
    deploy('gen2', 'assets/app-2.js' => 'two')

    assert_target_files ['assets/app-1.js', 'assets/app-2.js']

    deploy('gen3', 'assets/app-3.js' => 'three')

    assert_target_files ['assets/app-2.js', 'assets/app-3.js']
    assert_equal %w[gen2 gen3], generations_index
  end

  def test_the_newest_package_wins_for_files_it_overwrites
    deploy('gen1', 'assets/app-1.js' => 'one')
    deploy('gen2', 'assets/app-2.js' => 'two')

    assert_equal 'gen2', File.read(File.join(@target, 'commit_hash'))
    assert_equal '{"gen2":true}', File.read(File.join(@target, '.vite/manifest.json'))
  end

  def test_an_unpack_that_dies_part_way_leaves_the_old_marker
    deploy('gen1', 'assets/app-1.js' => 'one')

    packager = packager('gen2')
    FileUtils.rm_rf(@dist)
    write_dist('index.html' => 'page', '.vite/manifest.json' => '{"gen2":true}', 'assets/app-2.js' => 'two')
    package = packager.create_package('/dist', extra_paths: ['.vite'])
    RakeUtils.stubs(:system).raises(RuntimeError, 'unpack killed')

    assert_raises(RuntimeError) {packager.decompress_package(package)}

    # The next run must see a stale directory and unpack again, so the marker
    # may not name a package that never landed.
    assert_equal 'gen1', File.read(File.join(@target, 'commit_hash'))
  end

  def test_a_file_still_used_by_the_newest_generation_is_not_pruned
    deploy('gen1', 'assets/shared.js' => 'shared')
    deploy('gen2', 'assets/shared.js' => 'shared')
    deploy('gen3', 'assets/app-3.js' => 'three')

    assert_path_exists File.join(@target, 'assets/shared.js')
  end

  def test_a_directory_unpacked_before_generations_existed_is_kept_one_more_deploy
    FileUtils.mkdir_p(File.join(@target, 'assets'))
    File.write(File.join(@target, 'assets/legacy.js'), 'legacy')
    File.write(File.join(@target, 'commit_hash'), 'gen0')

    deploy('gen1', 'assets/app-1.js' => 'one')

    assert_equal %w[gen0 gen1], generations_index
    assert_path_exists File.join(@target, 'assets/legacy.js')

    deploy('gen2', 'assets/app-2.js' => 'two')

    refute_path_exists File.join(@target, 'assets/legacy.js')
  end

  private def packager(commit_hash, resolve_from_pointer: false)
    TurboS3Packaging.any_instance.stubs(:turbo_hash).returns(commit_hash)
    TurboS3Packaging.new('studio', @root, @target, @root, '@code-dot-org/studio', resolve_from_pointer: resolve_from_pointer)
  end

  # Builds a package from a fresh dist tree and unpacks it, as a deploy does.
  private def deploy(commit_hash, assets)
    FileUtils.rm_rf(@dist)
    write_dist({'index.html' => 'page', '.vite/manifest.json' => %({"#{commit_hash}":true})}.merge(assets))
    packager = packager(commit_hash)
    packager.decompress_package(packager.create_package('/dist', extra_paths: ['.vite']))
  end

  private def write_dist(files)
    files.each do |path, contents|
      full_path = File.join(@dist, path)
      FileUtils.mkdir_p(File.dirname(full_path))
      File.write(full_path, contents)
    end
  end

  private def generations_index
    File.readlines(File.join(@target, '.generations/index'), chomp: true)
  end

  # Asserts on the asset files only; index.html, commit_hash and the manifest
  # are overwritten by every generation.
  private def assert_target_files(expected)
    actual = Dir.glob('assets/*', base: @target).sort
    assert_equal expected, actual
  end
end

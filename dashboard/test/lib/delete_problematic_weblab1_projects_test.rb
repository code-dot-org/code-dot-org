require 'test_helper'
require 'stringio'
require 'tmpdir'

require_relative '../../../bin/oneoff/delete-problematic-weblab1-projects'

class DeleteProblematicWeblab1ProjectsTest < ActiveSupport::TestCase
  class FakeFileBucket
    def initialize(manifests:, files:)
      @manifests = manifests
      @files = files
    end

    def get_manifest(channel_id)
      manifest = @manifests.fetch(channel_id, [])
      raise manifest if manifest.is_a?(Exception)

      manifest
    end

    def get(channel_id, filename)
      file = @files[[channel_id, filename]]
      return {status: 'NOT_FOUND'} unless file

      if file.is_a?(Hash)
        {
          status: 'FOUND',
          body: StringIO.new(file.fetch(:body)),
          version_id: file[:version_id]
        }
      else
        {status: 'FOUND', body: StringIO.new(file)}
      end
    end

    protected def s3_path(owner_id, storage_app_id, filename = nil)
      "files/#{owner_id}/#{storage_app_id}/#{filename}"
    end
  end

  class FakeProjectDeleter
    def initialize(deleted_channel_ids)
      @deleted_channel_ids = deleted_channel_ids
    end

    def delete(channel_id)
      @deleted_channel_ids << channel_id
      true
    end
  end

  test 'clean html projects are logged and not deleted' do
    with_temp_paths do |checkpoint_path, deleted_ids_path, bad_html_links_path|
      runner, logger, deleted_channel_ids = build_runner(
        rows: [{id: 5, storage_id: 11, state: 'active'}],
        manifests: {'11-5' => [{'filename' => 'index.html'}]},
        files: {['11-5', 'index.html'] => '<div>ok</div>'},
        checkpoint_path: checkpoint_path,
        deleted_ids_path: deleted_ids_path,
        bad_html_links_path: bad_html_links_path
      )

      runner.run

      assert_equal [], deleted_channel_ids
      assert_equal "5\n", File.read(checkpoint_path)
      refute File.exist?(deleted_ids_path)
      refute File.exist?(bad_html_links_path)
      assert_includes logger.string, 'clean project_id=5'
    end
  end

  test 'invalid html projects are soft deleted and bad html links are logged' do
    with_temp_paths do |checkpoint_path, deleted_ids_path, bad_html_links_path|
      runner, logger, deleted_channel_ids = build_runner(
        rows: [{id: 7, storage_id: 13, state: 'active'}],
        manifests: {'13-7' => [{'filename' => 'index.html'}, {'filename' => 'style.css'}]},
        files: {
          ['13-7', 'index.html'] => {
            body: '<button onclick="alert(1)">bad</button>',
            version_id: 'abc123'
          }
        },
        delete: true,
        checkpoint_path: checkpoint_path,
        deleted_ids_path: deleted_ids_path,
        bad_html_links_path: bad_html_links_path
      )

      runner.run

      assert_equal ['13-7'], deleted_channel_ids
      assert_equal "7\n", File.read(checkpoint_path)
      assert_equal "7\n", File.read(deleted_ids_path)
      assert_equal(
        "https://s3.console.aws.amazon.com/s3/object/#{CDO.files_s3_bucket}?region=#{ERB::Util.url_encode(CDO.aws_region)}&prefix=files%2F13%2F7%2Findex.html&versionId=abc123\n",
        File.read(bad_html_links_path)
      )
      assert_includes logger.string, 'deleted project_id=7'
    end
  end

  test 'non-active projects are skipped in ruby after query' do
    with_temp_paths do |checkpoint_path, deleted_ids_path, bad_html_links_path|
      runner, logger, deleted_channel_ids = build_runner(
        rows: [
          {id: 2, storage_id: 10, state: 'deleted'},
          {id: 3, storage_id: 10, state: 'active'}
        ],
        manifests: {'10-3' => [{'filename' => 'index.html'}]},
        files: {['10-3', 'index.html'] => '<div>ok</div>'},
        checkpoint_path: checkpoint_path,
        deleted_ids_path: deleted_ids_path,
        bad_html_links_path: bad_html_links_path
      )

      runner.run

      assert_equal [], deleted_channel_ids
      assert_equal "3\n", File.read(checkpoint_path)
      refute File.exist?(bad_html_links_path)
      assert_includes logger.string, 'skip project_id=2 state=deleted'
    end
  end

  test 'file fetch errors are logged and do not delete the project' do
    with_temp_paths do |checkpoint_path, deleted_ids_path, bad_html_links_path|
      runner, logger, deleted_channel_ids = build_runner(
        rows: [{id: 9, storage_id: 12, state: 'active'}],
        manifests: {'12-9' => [{'filename' => 'index.html'}]},
        files: {},
        delete: true,
        checkpoint_path: checkpoint_path,
        deleted_ids_path: deleted_ids_path,
        bad_html_links_path: bad_html_links_path
      )

      runner.run

      assert_equal [], deleted_channel_ids
      assert_equal "9\n", File.read(checkpoint_path)
      refute File.exist?(deleted_ids_path)
      refute File.exist?(bad_html_links_path)
      assert_includes logger.string, 'error project_id=9'
    end
  end

  test 'explicit start id wins over checkpoint file' do
    Dir.mktmpdir do |dir|
      checkpoint_path = File.join(dir, 'delete-problematic-weblab1-projects.lastid.txt')
      File.write(checkpoint_path, "42\n")

      assert_equal 7, DeleteProblematicWeblab1Projects.resolve_start_id(
        start_id: 7,
        checkpoint_path: checkpoint_path
      )
    end
  end

  test 'dry-run and delete mode use different default state directories' do
    assert_equal(
      File.join(Dir.home, 'dryrun-delete-problematic-weblab1-projects', 'lastid.txt'),
      DeleteProblematicWeblab1Projects.default_checkpoint_path(delete: false)
    )
    assert_equal(
      File.join(Dir.home, 'dryrun-delete-problematic-weblab1-projects', 'bad-html-links.txt'),
      DeleteProblematicWeblab1Projects.default_bad_html_links_path(delete: false)
    )
    assert_equal(
      File.join(Dir.home, 'delete-problematic-weblab1-projects', 'lastid.txt'),
      DeleteProblematicWeblab1Projects.default_checkpoint_path(delete: true)
    )
    assert_equal(
      File.join(Dir.home, 'delete-problematic-weblab1-projects', 'deleted.txt'),
      DeleteProblematicWeblab1Projects.default_deleted_ids_path(delete: true)
    )
  end

  test 'checkpoint file is overwritten to the highest completed id' do
    with_temp_paths do |checkpoint_path, deleted_ids_path, bad_html_links_path|
      runner, = build_runner(
        rows: [
          {id: 1, storage_id: 20, state: 'active'},
          {id: 4, storage_id: 20, state: 'active'}
        ],
        manifests: {
          '20-1' => [{'filename' => 'index.html'}],
          '20-4' => [{'filename' => 'index.html'}]
        },
        files: {
          ['20-1', 'index.html'] => '<div>one</div>',
          ['20-4', 'index.html'] => '<div>two</div>'
        },
        batch_size: 1,
        checkpoint_path: checkpoint_path,
        deleted_ids_path: deleted_ids_path,
        bad_html_links_path: bad_html_links_path
      )

      runner.run

      assert_equal "4\n", File.read(checkpoint_path)
      assert_empty Dir.glob("#{checkpoint_path}.tmp.*")
    end
  end

  private def build_runner(rows:, manifests:, files:, delete: false, batch_size: 100, checkpoint_path:, deleted_ids_path:, bad_html_links_path:)
    logger = StringIO.new
    deleted_channel_ids = []

    runner = DeleteProblematicWeblab1Projects.new(
      start_id: 0,
      batch_size: batch_size,
      worker_count: 2,
      checkpoint_every_batches: 1,
      delete: delete,
      checkpoint_path: checkpoint_path,
      deleted_ids_path: deleted_ids_path,
      bad_html_links_path: bad_html_links_path,
      logger: logger,
      project_batch_loader: lambda do |after_id, limit|
        rows.select {|row| row[:id] > after_id}.sort_by {|row| row[:id]}.first(limit)
      end,
      channel_id_resolver: ->(storage_id, project_id) {"#{storage_id}-#{project_id}"},
      file_bucket_factory: -> {FakeFileBucket.new(manifests:, files:)},
      html_validator: ->(html) {html.exclude?('onclick=')},
      project_deleter_factory: ->(_storage_id) {FakeProjectDeleter.new(deleted_channel_ids)}
    )

    [runner, logger, deleted_channel_ids]
  end

  private def with_temp_paths
    Dir.mktmpdir do |dir|
      checkpoint_path = File.join(dir, 'delete-problematic-weblab1-projects.lastid.txt')
      deleted_ids_path = File.join(dir, 'delete-problematic-weblab1-projects.deleted.txt')
      bad_html_links_path = File.join(dir, 'bad-html-links.txt')
      yield checkpoint_path, deleted_ids_path, bad_html_links_path
    end
  end
end

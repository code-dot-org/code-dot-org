# Enumerates a channel's AI-generated image assets across S3 versions.
# BucketHelper#list sees only current objects and its list_versions drops
# object keys, so this walks list_object_versions itself: a generation the
# editor's cleanup deleted survives only as a noncurrent version behind a
# delete marker.
class SpritelabLab2GeneratedAssets < AssetBucket
  # Generated uploads are named generated-<uuid>.<ext>; see
  # apps/src/p5lab/spritelab/lab2/ai/images/imageGeneration.ts.
  GENERATED_FILENAME = /\Agenerated-/

  # list_object_versions pages at 1000 records; an unbounded walk of a
  # version-heavy channel is beyond what this page is for.
  VERSION_PAGES_LISTED = 5

  # Returns [{filename:, version_id:, last_modified:}, ...], newest first,
  # version_id naming each file's newest surviving version. A key whose
  # versions all expired leaves only its delete marker and is skipped.
  def generated_files(encrypted_channel_id)
    owner_id, storage_app_id = get_storage_id_and_project_id(encrypted_channel_id)
    prefix = s3_path owner_id, storage_app_id
    versions = []
    s3.list_object_versions(bucket: @bucket, prefix: prefix).each.with_index do |page, index|
      versions.concat(page.versions)
      break if index + 1 >= VERSION_PAGES_LISTED
    end
    files = versions.group_by(&:key).filter_map do |key, key_versions|
      filename = key.delete_prefix(prefix)
      next unless GENERATED_FILENAME.match?(filename)
      newest = key_versions.max_by(&:last_modified)
      {
        filename: filename,
        version_id: newest.version_id,
        last_modified: newest.last_modified,
      }
    end
    files.sort_by {|file| file[:last_modified]}.reverse
  end
end

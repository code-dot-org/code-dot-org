require 'cdo/local_development/s3_emulation/populator'

module Cdo
  # Common place for any web application server logic intended to make local
  # development behave more like production without relying on production
  # resources.
  module LocalDevelopment
    # Populates locally-hosted buckets in development environments without full AWS access
    # by leveraging `Populate` classes. Will automatically attempt to use the
    # most-specific one which can be applied, based on the given bucket and key.
    #
    # For example:
    #
    #    populate_local_s3_bucket("cdo-sound-library", "hoc_song_meta/songManifest2024_v4.json")
    #
    # Will check for classes in the following order:
    #
    #    CdoSoundLibrary::HocSongMeta::SongManifest2024V4.json::Populate
    #    CdoSoundLibrary::HocSongMeta::Populate
    #    CdoSoundLibrary::Populate
    #    Populate
    #
    # And will invoke the `populate` method on the first one that actually exists; in this
    # example, CdoSoundLibrary::HocSongMeta::Populate.
    #
    # See `lib/cdo/local_development/s3_emulation/`; in particular,
    # `cdo_sound_library/hoc_song_meta/populate.rb`
    def self.populate_local_s3_bucket(bucket, key)
      return unless CDO.aws_s3_emulated
      return if AWS::S3.exists_in_bucket(bucket, key)

      # Determine the Populator class that can generate files for this bucket, if it
      # exists. We allow subdirectories to have their own populators, so this will find
      # them, in that case, or ascend up the hierarchy instead.
      path_parts = [bucket, *key.split('/')]
      class_parts = path_parts.map do |part|
        part.tr('-', '_').camelize
      end

      # The 'base' will be the most specific populator found for the path
      # within the bucket. Start by attempting to set `base` to a Populate
      # class found in a module containing every possible `class_part` we
      # discovered; a NameError means no such class exists, so if we get one we
      # remove the least-significant part of the potential path and try again
      # until we find one that works.
      base = nil
      relative_path = []
      until class_parts.empty?
        begin
          base = [*class_parts, 'Populate'].join('::').constantize
          relative_path << path_parts.pop
          break if base
        rescue NameError
          class_parts.pop
        end
      end

      base.new.populate(File.join(*relative_path)) if base && relative_path
    end
  end
end

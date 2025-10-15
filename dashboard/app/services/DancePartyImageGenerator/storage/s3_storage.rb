# frozen_string_literal: true

require "json"
require "base64"
require "mini_magick"
require "fileutils"

module DancePartyImageGenerator
  module Storage
    class S3Storage
      attr_reader :bucket

      def initialize(bucket:, namespace: nil, upload_opts: {})
        @bucket     = bucket
        @namespace  = normalize_namespace(namespace)
        @upload_opts = {no_random: true}.merge(upload_opts)
      end

      def full_key(key)
        return key if @namespace.blank?
        File.join(@namespace, key)
      end

      # basic ops

      def write_json(key, json)
        data = json.is_a?(String) ? json : JSON.pretty_generate(json)
        AWS::S3.upload_to_bucket(
          @bucket,
          full_key(key),
          data,
          **@upload_opts.merge(content_type: "application/json")
        )
        true
      end

      def read_json(key)
        body = AWS::S3.download_from_bucket(@bucket, full_key(key))
        JSON.parse(body)
      end

      def list_json(prefix)
        absolute = AWS::S3.find_objects_with_ext(@bucket, ".json", full_key(prefix)) || []
        absolute.
          select {|k| k.end_with?("-metadata.json")}.
          map {|k| relativize(k)}
      end

      def write_png_base64(key, b64, width: nil, height: nil)
        bytes = Base64.decode64(b64)
        if width && height
          image = MiniMagick::Image.read(bytes)
          if image.width != width || image.height != height
            image.resize("#{width}x#{height}!")
            bytes = image.to_blob
          end
        end
        AWS::S3.upload_to_bucket(
          @bucket,
          full_key(key),
          bytes,
          **@upload_opts.merge(content_type: "image/png")
        )
        true
      end

      def read_png(key)
        data = AWS::S3.download_from_bucket(@bucket, full_key(key))
        MiniMagick::Image.read(data)
      end

      # path helpers

      module Storage
        module_function def path_for(dest:, base:, ext:)
          folder =
            case dest
            when :animal          then "animal"
            when :animal_attire   then "animal-attire"
            else                        "adjective-animal-attire"
            end
          File.join(folder, "#{base}#{ext}")
        end

        module_function def png_for(meta_key, meta)
          dir  = File.dirname(meta_key)
          file = meta["file_name"] || File.basename(meta_key).sub(/-metadata\.json\z/, ".png")
          File.join(dir, file)
        end

        module_function def mirror_keys(root, meta_key, png_key)
          dir     = File.dirname(meta_key)
          out_dir = File.join(root.to_s, dir)
          FileUtils.mkdir_p(out_dir)
          base = File.basename(png_key, ".png")
          [File.join(out_dir, "#{base}.png"), File.join(out_dir, "#{base}-metadata.json")]
        end
      end

      private def normalize_namespace(ns)
        return nil if ns.nil? || ns.to_s.strip.empty?
        ns.to_s.delete_prefix('/').delete_suffix('/')
      end

      private def relativize(key)
        return key if @namespace.blank?
        key.start_with?(@namespace + "/") ? key[@namespace.size + 1..] : key
      end
    end
  end
end

require 'active_support/concern'

module Services
  module CurriculumPdfs
    module Utils
      extend ActiveSupport::Concern
      class_methods do
        # Simple helper for comparing serialized_at and seeded_from values. Because
        # these values sometimes come from json and sometimes come from the
        # database, we want to do some normalization to make our inequality
        # comparison more consistent.
        def timestamps_equal(left, right)
          left = Time.parse(left) if left.is_a? String
          right = Time.parse(right) if right.is_a? String
          return left.to_i == right.to_i
        end

        def get_base_url
          # For production, we have a full CloudFormation stack set up which serves
          # the bucket from a subdomain via CloudFront. We do this so the
          # user-facing button can work as a download button rather than just a
          # link, which we can't do with a cross-origin URL.
          #
          # We don't have an equivalent set up for the debug bucket, so we just use
          # the direct S3 link.
          DEBUG ? "https://#{S3_BUCKET}.s3.amazonaws.com" : "https://lesson-plans.code.org"
        end

        def pdf_exists_at?(pathname)
          return false if pathname.blank?

          # Only use the shared cache if it's backed by MemCache (as it is in
          # prod), not if it's using the filesystem-backed cache (as it does
          # everywhere else).
          #
          # The filesystem-backed cache won't ever automatically expire entries
          # and we don't manually expire upon generation, so we want to avoid
          # using it or our PDF generation logic will keep regenerating the
          # same PDFs indefinitely.
          should_cache = CDO.shared_cache.is_a?(ActiveSupport::Cache::MemCacheStore)

          if should_cache
            cache_key = "CurriculumPdfs/pdf_exists/#{pathname.inspect}"
            return CDO.shared_cache.read(cache_key) if CDO.shared_cache.exist?(cache_key)
          end

          result = AWS::S3.exists_in_bucket(S3_BUCKET, pathname)

          # Note that we don't set an explicit `expires_in` value here. We
          # expect that PDFs will only ever go from not generated to generated
          # as the result of content changes, which should also update the
          # identifying pathname. We also expect that PDFs will never go away
          # once generated. If either of these expectations is invalidated in
          # the future, we should probably start automatically expiring these
          # cache values.
          CDO.shared_cache.write(cache_key, result) if should_cache

          return result
        end
      end
    end
  end
end

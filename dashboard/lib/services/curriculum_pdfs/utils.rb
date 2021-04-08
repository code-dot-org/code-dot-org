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
      end
    end
  end
end

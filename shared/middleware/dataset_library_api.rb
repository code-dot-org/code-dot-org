require 'aws-sdk-s3'
require 'cdo/rack/request'
require 'sinatra/base'
require 'cdo/sinatra'
require 'cdo/aws/s3'

DATASET_LIBRARY_BUCKET = 'cdo-dataset-library'.freeze

#
# Provides limited access to the cdo-dataset-library S3 bucket, which contains
# Code.org-curated content, not user content.
#
class DatasetLibraryApi < Sinatra::Base
  helpers do
    load(CDO.dir('shared', 'middleware', 'helpers', 'core.rb'))
  end

  #
  # GET /api/v1/dataset-library/<filename>
  #
  # Retrieve a file from the dataset library
  #
  get %r{/api/v1/dataset-library/(.+)} do |dataset_name|
    not_found if dataset_name.empty?

    begin
      result = Aws::S3::Bucket.
        new(DATASET_LIBRARY_BUCKET, client: AWS::S3.create_client).
        object_versions(prefix: dataset_name).
        find {|version| !version.head.delete_marker}.
        get

      content_type result.content_type
      cache_for 3600
      result.body.string
    end
  end
end

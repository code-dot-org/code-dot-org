require 'aws-sdk-s3'
require 'date'
require 'parallel'

# API that serves UI test status based on uploaded test run S3 logs and their
# metadata.  See runner.rb, test_status.haml and test_status.js for more
# information.
class Api::V1::TestLogsController < ApplicationController
  # GET /api/v1/test_logs/<*prefix>/since/<timestamp>
  def get_logs_since
    boundary_time = Time.at(params[:time].to_i)
    bucket = Aws::S3::Bucket.new('cucumber-logs')
    objects = bucket.objects({prefix: "#{params[:prefix]}/"})
    objects_to_render = objects.select {|summary| boundary_time <= summary.last_modified}
    json_result = Parallel.map(objects_to_render, in_threads: Parallel.processor_count) do |summary|
      object = bucket.object(summary.key)
      {
        key: summary.key,
        last_modified: summary.last_modified,
        version_id: object.version_id,
        commit: object.metadata['commit'],
        attempt: object.metadata['attempt'],
        success: object.metadata['success'],
        duration: object.metadata['duration']
      }
    end
    render json: json_result
  end

  # GET /api/v1/test_logs/<*prefix>/<log-name>
  def get_log_details
    bucket = Aws::S3::Bucket.new('cucumber-logs')
    object = bucket.object("#{params[:prefix]}/#{params[:name]}.#{params[:format]}")
    render json: {
      version_id: object.version_id,
      commit: object.metadata['commit'],
      attempt: object.metadata['attempt'],
      success: object.metadata['success'],
      duration: object.metadata['duration']
    }
  end
end

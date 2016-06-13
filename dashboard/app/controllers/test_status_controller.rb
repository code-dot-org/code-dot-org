require 'aws-sdk'

class TestStatusController < ApplicationController
  def test_run_status
    bucket = Aws::S3::Bucket.new('cucumber-logs')
    render json: bucket.objects({prefix: "#{params[:branch]}/"}).map {|summary| {
        key: summary.key,
        last_modified: summary.last_modified
    }}
    # render json: bucket.objects({prefix: "#{params[:branch]}/"}).map {|summary|
    #   object = summary.object
    #   {
    #       key: summary.key,
    #       version_id: object.version_id,
    #       last_modified: summary.last_modified,
    #       commit: object.metadata['commit'],
    #   }
    # }
  end

  def test_status
    bucket = Aws::S3::Bucket.new('cucumber-logs')
    object = bucket.object("#{params[:branch]}/#{params[:name]}.#{params[:format]}")
    render json: {
        version_id: object.version_id,
        commit: object.metadata['commit'],
        attempt: object.metadata['attempt'],
        success: object.metadata['success'],
        duration: object.metadata['duration']
    }
  end
end
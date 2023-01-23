# API routes ported from legacy/middleware/files_api.rb
require 'cdo/aws/s3'

class FilesApiController < ApplicationController
  # PATCH /v3/(animations|assets|sources|files|libraries)/:channel_id?abuse_score=<abuse_score>
  # Update all assets for the given channelId to have the provided abuse score
  def update
    abuse_score = params[:abuse_score]
    not_modified if abuse_score.nil?
    endpoint = params[:endpoint]

    buckets = get_bucket_impl(endpoint).new

    begin
      files = buckets.list(encrypted_channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      raise ActionController::BadRequest.new, "Bad channel_id"
    end
    files.each do |file|
      not_authorized unless can_update_abuse_score?(endpoint, encrypted_channel_id, file[:filename], abuse_score)
      buckets.replace_abuse_score(encrypted_channel_id, file[:filename], abuse_score)
    end

    render json: {abuse_score: abuse_score}
  end

  private

  def get_bucket_impl(endpoint)
    case endpoint
    when 'animations'
      AnimationBucket
    when 'assets'
      AssetBucket
    when 'files'
      FileBucket
    when 'sources'
      SourceBucket
    when 'libraries'
      LibraryBucket
    else
      raise ActionController::RoutingError, 'Not Found'
    end
  end

  def can_update_abuse_score?(endpoint, encrypted_channel_id, filename, new_score)
    return true if has_permission?('project_validator') || new_score.nil?

    get_bucket_impl(endpoint).new.get_abuse_score(encrypted_channel_id, filename) <= new_score.to_i
  end
end

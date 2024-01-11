class ProjectDataDbController < ApplicationController
  # GET /datasets
  def index
    @project = Project.find_by_channel_id(params[:channel_id])
    @key_value_pairs = KeyValuePair.where(channel_id: params[:channel_id])
    puts "####################################################"
  end

  def get_key_value
    render json: KeyValuePair.find(channel_id: params[:channel_id], key: params[:key])
  rescue
    # If the key doesn't exist, return value: null
    render json: {channel_id: params[:channel_id], key: params[:key], value: nil}
  end

  def set_key_value
    kvp = KeyValuePair.create(channel_id: params[:channel_id], key: params[:key], value: params[:value])
    render :json => kvp.as_json
  end

  def create_record
  end

  def read_records
  end

  def update_record
  end

  def delete_record
  end
end

class ProjectDataDbController < ApplicationController
  # GET /datasets
  def index
    @project = Project.find_by_channel_id(params[:channel_id])
    @key_value_pairs = KeyValuePair.where(channel_id: params[:channel_id])
    puts "####################################################"
  end

  def get_key_value
  end

  def set_key_value
    KeyValuePair.create(channel_id: params[:channel_id], key: params[:key], value: params[:value])
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

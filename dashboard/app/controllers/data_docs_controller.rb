class DataDocsController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env
  load_and_authorize_resource

  # GET /data_docs/new
  def new
  end

  # POST /data_docs
  def create
    @data_doc = DataDoc.new(key: params[:key], name: params[:name], content: params[:content])

    if @data_doc.save
      # TODO [meg] : Write serialization
      render :ok # TODO [meg] : Redirect to new data doc, e.g. redirect_to @data_doc
    else
      render :not_acceptable, json: @data_doc.errors
    end
  end
end

class DataDocsController < ApplicationController
  load_and_authorize_resource

  # POST /data_docs
  def create
    @data_doc = DataDoc.new(key: params[:key], name: params[:name], content: params[:content])

    if @data_doc.save
      # TODO [meg] : Write serialization
      redirect_to @data_doc
    else
      render :not_acceptable, json: @data_doc.errors
    end
  end
end

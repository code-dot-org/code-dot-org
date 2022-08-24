class DataDocsController < ApplicationController
  # POST /data_docs
  def create
    @data_doc = DataDoc.new(
      params[:data_doc]
    )

    if @data_doc.save
      # TODO [meg] : Write serialization
      redirect_to @data_doc
    else
      render :not_acceptable, json: @data_doc.errors
    end
  end
end

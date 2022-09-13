class DataDocsController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env # TODO [meg]: add except: [:show] to launch
  load_and_authorize_resource

  # GET /data_docs/new
  def new
  end

  # POST /data_docs
  def create
    @data_doc = DataDoc.new(key: params[:key], name: params[:name], content: params[:content])

    if @data_doc.save
      # TODO [meg] : Write serialization
      render :ok, json: {} # TODO [meg] : Redirect to new data doc, e.g. redirect_to @data_doc
    else
      render :not_acceptable, json: @data_doc.errors
    end
  end

  def to_param
    key
  end

  # GET /data_docs/:key
  def show
    @data_doc = DataDoc.find_by(key: params[:key])
    return render :not_found unless @data_doc

    @data_doc_name = @data_doc.name
    @data_doc_content = @data_doc.content
  end
end

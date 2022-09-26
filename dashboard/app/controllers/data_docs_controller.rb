class DataDocsController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env, except: [:show, :index]
  authorize_resource

  # GET /data_docs/new
  def new
  end

  # POST /data_docs
  def create
    @data_doc = DataDoc.new(key: params[:key], name: params[:name], content: params[:content])

    if @data_doc.save
      @data_doc.write_serialization
      redirect_to @data_doc
    else
      render status: :bad_request, json: @data_doc.errors
    end
  end

  # GET /data_docs/:key
  def show
    @data_doc = DataDoc.find_by(key: params[:key])
    return render :not_found unless @data_doc

    @data_doc_data = {
      dataDocName: @data_doc.name,
      dataDocContent: @data_doc.content,
    }
  end

  # GET /data_docs
  def index
    @data_docs = DataDoc.all.order(:name).map(&:serialize)
  end
end

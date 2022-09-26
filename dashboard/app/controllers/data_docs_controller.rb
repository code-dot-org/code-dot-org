class DataDocsController < ApplicationController
  before_action :require_levelbuilder_mode_or_test_env, except: [:show]
  before_action :set_data_doc, only: [:show, :edit, :update]
  load_and_authorize_resource

  # GET /data_docs/new
  def new
  end

  # POST /data_docs
  def create
    @data_doc = DataDoc.new(key: params[:key], name: params[:name], content: params[:content])

    if @data_doc.save
      @data_doc.write_serialization
      redirect_to action: :show, key: params[:key]
    else
      render :not_acceptable, json: @data_doc.errors
    end
  end

  def to_param
    key
  end

  # GET /data_docs/:key
  def show
    @data_doc_data = {
      dataDocName: @data_doc.name,
      dataDocContent: @data_doc.content,
    }
  end

  # GET /data_docs/:key/edit
  def edit
    @data_doc_data = {
      dataDocKey: @data_doc.key,
      dataDocName: @data_doc.name,
      dataDocContent: @data_doc.content,
    }
  end

  # PUT /data_docs/:key
  def update
    # ensure data_doc key is immutable
    new_attributes = data_doc_params.except(:key)
    @data_doc.update!(new_attributes)

    render json: @data_doc.summarize_for_edit.to_json
  end

  def data_doc_params
    params.permit(
      :key,
      :name,
      :content
    )
  end

  def set_data_doc
    @data_doc = DataDoc.find_by(key: params[:key])
    return render :not_found unless @data_doc
  end
end

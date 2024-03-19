# DatablockStorage is the backend for the 'Data' tab of Applab, the 'Data' blocks
# and the dataset browser. DatablockStorage stores student-controlled data generated
# by and with the data blocks like `createRecord`, `updateRecord`, `setKeyValue`, etc.
#
# These backend methods are accessed by a thin wrapper on the JS side: datablockStorage.js
#
# Student data is stored in corresponding ActiveRecord models:
# - DatablockStorageTable: stores a list of tables and their columns
# - DatablockStorageRecord: stores the records in each table
# - DatablockStorageKvp: stores key-value pairs
#
# Metadata for the code.org defined datasets are stored in:
# - DatablockStorageLibraryManifest

class DatablockStorageController < ApplicationController
  before_action :validate_channel_id
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token

  StudentFacingError = DatablockStorageTable::StudentFacingError

  rescue_from StudentFacingError do |exception|
    render json: {msg: exception.message, type: exception.type}, status: :bad_request
  end

  SUPPORTED_PROJECT_TYPES = ['applab', 'gamelab']

  ##########################################################
  #   Debug View                                           #
  ##########################################################
  def index
    @key_value_pairs = DatablockStorageKvp.where(project_id: @project_id)
    @records = DatablockStorageRecord.where(project_id: @project_id)
    @tables = DatablockStorageTable.where(project_id: @project_id)
    @library_manifest = DatablockStorageLibraryManifest.instance.library_manifest
    @storage_backend = ProjectUseDatablockStorage.use_data_block_storage_for?(params[:channel_id]) ? "Datablock Storage" : "Firebase"
  end

  ##########################################################
  #   Key-Value-Pair API                                   #
  ##########################################################

  def set_key_value
    raise StudentFacingError, "The value is too large. The maximum allowable size is #{DatablockStorageKvp::MAX_VALUE_LENGTH} bytes" if params[:value].length > DatablockStorageKvp::MAX_VALUE_LENGTH
    value = JSON.parse params[:value]
    DatablockStorageKvp.set_kvp @project_id, params[:key], value
    render json: {key: params[:key], value: value}
  end

  def get_key_value
    kvp = DatablockStorageKvp.find_by(project_id: @project_id, key: params[:key])
    render json: kvp ? JSON.parse(kvp.value).to_json : nil
  end

  def delete_key_value
    key = params[:key]
    DatablockStorageKvp.where(project_id: @project_id, key: key).delete_all

    render json: true
  end

  def get_key_values
    kvps = DatablockStorageKvp.get_kvps(@project_id)
    render json: kvps
  end

  def populate_key_values
    key_values_json = JSON.parse params[:key_values_json]
    raise "key_values_json must be a hash" unless key_values_json.is_a? Hash

    DatablockStorageKvp.set_kvps(@project_id, key_values_json, upsert: false)

    render json: true
  rescue JSON::ParserError => exception
    raise StudentFacingError, "SyntaxError #{exception.message}\n while parsing initial key/value data: #{params[:key_values_json]}"
  end

  ##########################################################
  #   Table API                                            #
  ##########################################################

  def create_table
    table_or_create

    render json: true
  end

  def add_shared_table
    DatablockStorageTable.add_shared_table @project_id, params[:table_name]

    render json: true
  rescue ActiveRecord::RecordNotUnique
    raise StudentFacingError.new(:DUPLICATE_TABLE_NAME), "There is already a table with name #{params[:table_name].inspect}"
  end

  def import_csv
    table = table_or_create

    # import_csv should overwrite existing data:
    table.records.delete_all

    table.import_csv params[:table_data_csv]
    table.save!

    render json: true
  end

  def export_csv
    table_name = params[:table_name]
    response.headers['Content-Disposition'] = "attachment; filename=\"#{table_name}.csv\""
    response.headers['Content-Type'] = 'text/csv'

    table = find_table
    render plain: table.export_csv
  end

  def clear_table
    table = find_table
    table.records.delete_all
    table.save!

    render json: true
  end

  def delete_table
    find_table.destroy

    render json: true
  end

  def get_table_names
    table_names = shared_table? ?
      DatablockStorageTable.get_shared_table_names :
      DatablockStorageTable.get_table_names(@project_id)

    render json: table_names
  end

  def populate_tables
    tables_json = JSON.parse params[:tables_json]
    DatablockStorageTable.populate_tables @project_id, tables_json
    render json: true
  rescue JSON::ParserError => exception
    raise StudentFacingError, "SyntaxError #{exception.message}\n while parsing initial table data: #{params[:tables_json]}"
  end

  ##########################################################
  #   Table Column API                                     #
  ##########################################################

  def add_column
    table = find_table
    table.add_column params[:column_name]
    table.save!

    render json: true
  end

  def rename_column
    table = find_table
    table.rename_column params[:old_column_name], params[:new_column_name]
    table.save!

    render json: true
  end

  def coerce_column
    table = find_table
    table.coerce_column params[:column_name], params[:column_type]
    table.save!

    render json: true
  end

  def delete_column
    table = find_table
    table.delete_column params[:column_name]
    table.save!

    render json: true
  end

  def get_column
    table = find_table
    column = table.get_column params[:column_name]
    render json: column
  rescue StudentFacingError
    render json: nil # javascript expects null returned to indicate a table doesn't exists error
  end

  def get_columns_for_table
    table = find_table_or_shared_table
    render json: table.get_columns
  end

  ##########################################################
  #   Table Record API                                     #
  ##########################################################

  def create_record
    raise StudentFacingError, "The record is too large. The maximum allowable size is #{DatablockStorageRecord::MAX_RECORD_LENGTH} bytes" if params[:record_json].length > DatablockStorageRecord::MAX_RECORD_LENGTH
    record_json = JSON.parse params[:record_json]
    raise "record must be a hash" unless record_json.is_a? Hash

    table = table_or_create
    table.create_records [record_json]
    table.save!

    render json: record_json
  end

  def read_records
    table = find_table_or_shared_table

    render json: table.read_records.map(&:record_json)
  end

  def update_record
    raise StudentFacingError, "The record is too large. The maximum allowable size is #{DatablockStorageRecord::MAX_RECORD_LENGTH} bytes" if params[:record_json].length > DatablockStorageRecord::MAX_RECORD_LENGTH

    table = find_table
    record_json = table.update_record params[:record_id], JSON.parse(params[:record_json])
    table.save!

    render json: record_json
  end

  def delete_record
    table = find_table
    begin
      table.delete_record params[:record_id]
    rescue ActiveRecord::RecordNotFound
      raise StudentFacingError, "You tried to delete a record with id \"#{params[:record_id]}\" from table \"#{table.table_name}\" but no recording matching that ID could be found."
    end
    table.save!
    render json: nil
  end

  ##########################################################
  #   Library Manifest API (shared table metadata)         #
  ##########################################################

  def get_library_manifest
    render json: DatablockStorageLibraryManifest.instance.library_manifest
  end

  def set_library_manifest
    library_manifest = JSON.parse params[:library_manifest]
    DatablockStorageLibraryManifest.instance.update!(library_manifest: library_manifest)
    render json: true
  end

  ##########################################################
  #   Channel API                                          #
  ##########################################################

  # Returns true if validation checks pass
  def channel_exists
    render json: true
  end

  # Deletes all datablock storage data for the project
  def clear_all_data
    DatablockStorageTable.where(project_id: @project_id).delete_all
    DatablockStorageKvp.where(project_id: @project_id).delete_all
    DatablockStorageRecord.where(project_id: @project_id).delete_all
    render json: true
  end

  ##########################################################
  #   Project Use Datablock Storage API                    #
  ##########################################################

  # TODO: post-firebase-cleanup, remove this code: #56994
  def use_datablock_storage
    ProjectUseDatablockStorage.set_data_block_storage_for!(params[:channel_id], true)
    render json: true
  end

  # TODO: post-firebase-cleanup, remove this code: #56994
  def use_firebase_storage
    ProjectUseDatablockStorage.set_data_block_storage_for!(params[:channel_id], false)
    render json: true
  end

  ##########################################################
  #   Private                                              #
  ##########################################################
  private

  def shared_table?
    ActiveRecord::Type::Boolean.new.cast(params[:is_shared_table])
  end

  def find_table_or_shared_table
    shared_table? ?
      DatablockStorageTable.find_shared_table(params[:table_name]) :
      find_table
  end

  def find_table
    DatablockStorageTable.find([@project_id, params[:table_name]])
  rescue ActiveRecord::RecordNotFound
    raise StudentFacingError, "You tried to use a table called \"#{params[:table_name]}\" but that table doesn't exist in this app"
  end

  def where_table
    DatablockStorageTable.where(project_id: @project_id, table_name: params[:table_name])
  end

  def table_or_create
    where_table.first_or_create
  end

  def validate_channel_id
    project = Project.find_by_channel_id(params[:channel_id])
    unless SUPPORTED_PROJECT_TYPES.include? project.project_type
      raise "DatablockStorage is only available for applab and gamelab projects"
    end
    @project_id = project.id
  end
end

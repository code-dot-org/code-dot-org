# DatablockStorage is the backend for the 'Data' tab of Applab, the 'Data' blocks
# and the data browser. DatablockStorage stores student-controlled data generated
# by and with the data blocks like `createRecord`, `updateRecord`, `setKeyValue`, etc.
#
# These backend methods are accessed exclusively by a thin wrapper on the JS side:
# datablockStorage.js. Each method in this controller has a corresponding method there.
#
# Methods in this controller are available as (see `:datablock_storage` in routes.rb):
# /datablock_storage/:channel_id/:method_name
#
# Student data is stored in MySQL in corresponding ActiveRecord models:
# - datablock_storage_table.rb: stores a list of tables and their columns, after this file
#   this model contains the most code.
# - datablock_storage_record.rb: stores the records in each table
# - datablock_storage_kvp.rb: stores key-value pairs
#
# Metadata for the code.org defined datasets are stored in:
# - datablock_storage_library_manifest.rb
#
# Methods are broken into sections, for example the Key-Value-Pair API, Table API,
# Table Column API, Table Record API, Library Manifest API & Project API
#
# More details can be found in the PR that initially created Datablock Storage:
# https://github.com/code-dot-org/code-dot-org/pull/56279

class DatablockStorageController < ApplicationController
  # These methods can be called by data blocks in applab/gamelab
  METHODS_CALLED_BY_DATA_BLOCKS = [
    :set_key_value,
    :get_key_value,
    :get_column,
    :create_record,
    :read_records,
    :update_record,
    :delete_record,
    :get_library_manifest,
  ]

  before_action :validate_channel_id

  # Methods that are called directly by data blocks need to be accessible
  # even when the applab/gamelab project is shared. In this case we won't
  # necessarily have a logged-in user.
  before_action :authenticate_user!, except: METHODS_CALLED_BY_DATA_BLOCKS

  StudentFacingError = DatablockStorageTable::StudentFacingError

  # A StudentFacingError can be thrown by any of the Datablock Storage models
  # and indicates that the error should show up in the Applab "Debug Console".
  #
  # Here we catch any of these errors, and return it in the expected JSON format to
  # datablockStorage.js, who in turn calls its onError() callback with appropriate data.
  rescue_from StudentFacingError do |exception|
    render json: {msg: exception.message, type: exception.type}, status: :bad_request
  end

  # We only permit requests to /datablock_storage/:channel_id for projects with
  # the appropriate project_type (aka game.app).
  SUPPORTED_PROJECT_TYPES = [
    Game::APPLAB,
    Game::GAMELAB,
  ]

  ##########################################################
  #   Key-Value-Pair API                                   #
  ##########################################################

  def set_key_value
    puts "trivial change"
    raise StudentFacingError, "Value must be specified" unless params[:value]
    value = JSON.parse params[:value]
    DatablockStorageKvp.set_kvp @project_id, params[:key], value
    render json: {key: params[:key], value: value}
  end

  def get_key_value
    kvp = DatablockStorageKvp.find_by(project_id: @project_id, key: params[:key])
    # render json: assumes a string is already json encoded, so to_json is necessary.
    render json: kvp&.value.to_json
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

  # Imports a table from the Data Library into the student's project
  def add_shared_table
    DatablockStorageTable.add_shared_table @project_id, params[:table_name]

    render json: true
  rescue ActiveRecord::RecordNotUnique
    raise StudentFacingError.new(:DUPLICATE_TABLE_NAME), "There is already a table with name #{params[:table_name].inspect}"
  end

  def import_csv
    table = table_or_create

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

  # populate_tables is used by levelbuilder to inject curriculum defined
  # initial table data into a project.
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

  # Typecast a column
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
    record_json = JSON.parse params[:record_json]
    raise "record must be a hash" unless record_json.is_a? Hash

    table = table_or_create
    Retryable.retryable(tries: 1, on: [ActiveRecord::RecordNotUnique]) do
      table.create_records [record_json]
    end
    table.save!

    render json: record_json
  end

  def read_records
    table = find_table_or_shared_table

    render json: table.read_records
  end

  def update_record
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
  #   Project API                                          #
  ##########################################################

  # Returns true if there is any data for the project
  def project_has_data
    is_there_data = DatablockStorageTable.exists?(project_id: @project_id) || DatablockStorageKvp.exists?(project_id: @project_id)
    render json: is_there_data
  end

  # Deletes all datablock storage data for the project
  def clear_all_data
    DatablockStorageTable.where(project_id: @project_id).delete_all
    DatablockStorageKvp.where(project_id: @project_id).delete_all
    DatablockStorageRecord.where(project_id: @project_id).delete_all
    render json: true
  end

  ##########################################################
  #   Private                                              #
  ##########################################################

  private def shared_table?
    ActiveRecord::Type::Boolean.new.cast(params[:is_shared_table])
  end

  private def find_table_or_shared_table
    shared_table? ?
      DatablockStorageTable.find_shared_table(params[:table_name]) :
      find_table
  end

  private def find_table
    DatablockStorageTable.find([@project_id, params[:table_name]])
  rescue ActiveRecord::RecordNotFound
    raise StudentFacingError, "You tried to use a table called \"#{params[:table_name]}\" but that table doesn't exist in this app"
  end

  private def where_table
    if params[:table_name] && params[:table_name].is_a?(String)
      DatablockStorageTable.where(project_id: @project_id, table_name: params[:table_name])
    else
      raise StudentFacingError, "Table parameter value must be a string"
    end
  end

  private def table_or_create
    where_table.first_or_create
  rescue ActiveRecord::ValueTooLong
    raise StudentFacingError.new(:TABLE_NAME_INVALID), "The table name is too long, it must be shorter than #{DatablockStorageTable.columns_hash['table_name'].limit} bytes ('characters')"
  rescue ActiveRecord::RecordNotUnique
    # first_or_create() is not atomic, retry in case a create was done in parallel
    where_table.first_or_create
  end

  private def validate_channel_id
    project = Project.find_by_channel_id(params[:channel_id])
    unless SUPPORTED_PROJECT_TYPES.include? project.project_type
      raise "DatablockStorage is only available for applab and gamelab projects"
    end
    @project_id = project.id
  end
end

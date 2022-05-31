require 'csv'
require 'cdo/chat_client'
require 'cdo/google/drive'

class CsvToSqlTable
  attr_reader :db, :table

  def initialize(path, params={})
    @db = params[:db] || PEGASUS_DB
    @path = path
    @table = File.basename(@path, File.extname(@path)).tr('-', '_').to_sym
  end

  def up_to_date?
    seed = @db[:seed_info].where(table: @table.to_s).first
    return false unless seed

    mtime = File.mtime(@path)
    mtime.to_s == seed[:mtime].to_s
  end

  def import
    import! unless up_to_date?
    @table
  end

  def import!
    ChatClient.log "Importing <b>#{@table}</b> table from <b>#{File.basename(@path)}</b>"

    # Starting with 1 means the first item's ID is 2 which matches the id to the line number of the item.
    at = 1

    CSV.open(@path, 'rb', encoding: 'utf-8') do |csv|
      table, columns = create_table(csv.shift)
      while values = csv.shift
        table.insert(hash_from_keys_and_values(columns, values).merge({id: at += 1}))
      end
    end

    set_table_mtime(File.mtime(@path))

    ChatClient.log "Imported <b>#{at - 1}</b> rows into <b>#{@table}</b>"

    @table
  end

  private

  def hash_from_keys_and_values(keys, values)
    h = {}
    (0..keys.count - 1).each do |i|
      key_name = keys[i].to_s
      value =
        case key_name[key_name.rindex('_')..-1]
        when '_b'
          values[i].to_bool
        when '_f'
          values[i].to_f
        when '_i'
          values[i].to_i
        else
          values[i]
        end

      h[keys[i]] = value
    end
    h
  end

  def create_table(columns)
    schema = columns.map {|column| column_name_to_schema(column)}

    @db.create_table!(@table, charset: 'utf8') do
      primary_key :id

      schema.each do |column|
        add_column column[:name], type: column[:type]
        index column[:name] if column[:index]
        unique column[:name] if column[:unique]
      end
    end

    [@db[@table], schema.map {|i| i[:name]}]
  end

  def column_name_to_schema(name)
    i = name.rindex('_')

    if i.nil?
      ChatClient.log "Bad column name (#{name}) for table (#{@table}), see this " \
        "<a href='https://drive.google.com/drive/folders/0B0OFfWqnAHxhM0prRGd0UWczMUU'>Google Drive</a> folder."
    end

    if name.ends_with?('!') || name.ends_with?('*')
      type_flag = name[-1..-1]
      name = name[0..-2]
    end

    type_info = name[i..-1]

    type = {
      '_b' => {type: 'boolean'},
      '_dt' => {type: 'datetime'},
      '_f' => {type: 'float'},
      '_i' => {type: 'integer'},
      '_bi' => {type: 'bigint'},
      '_s' => {type: 'varchar(255)'},
      '_ss' => {type: 'varchar(255)'},
      '_t' => {type: 'text'},
    }[type_info] || {type: 'varchar(255)'}

    type = type.merge(unique: true) if type_flag == '!'
    type = type.merge(index: true) if type_flag == '*'

    type.merge({name: name.to_sym})
  end

  def set_table_mtime(mtime)
    seed_info = @db[:seed_info]
    if seed_info.where(table: @table.to_s).first
      seed_info.where(table: @table.to_s).update(mtime: mtime)
    else
      seed_info.insert(table: @table.to_s, mtime: mtime)
    end
  end
end

class GSheetToCsv
  @@gdrive = nil

  def initialize(path)
    @gsheet_path, settings_yml = IO.read(path).strip.split("\n", 2)
    settings = YAML.load(settings_yml.to_s) || {}
    @include_columns = settings['include_columns'] || []
    @exclude_columns = settings['exclude_columns'] || []
    @csv_path = File.join(File.dirname(path), File.basename(path, File.extname(path)) + '.csv')
    @file = nil
  end

  def up_to_date?
    @file ||= (@@gdrive ||= Google::Drive.new).file(@gsheet_path)
    unless @file
      ChatClient.log "Google Drive file <b>#{@gsheet_path}</b> not found.", color: 'red', notify: 1
      return
    end

    begin
      mtime = @file.mtime
      ctime = File.mtime(@csv_path) if File.file?(@csv_path)
      return mtime.to_s == ctime.to_s
    rescue GoogleDrive::Error => e
      ChatClient.log "<p>Error getting modified time for <b>#{@gsheet_path}<b> from Google Drive.</p><pre><code>#{e.message}</code></pre>", color: 'yellow'
      true # Assume the current thing is up to date.
    end
  end

  def import
    import! unless up_to_date?
    @csv_path
  end

  def import!
    ChatClient.log "Downloading <b>#{@gsheet_path}</b> from Google Drive."

    @file ||= (@@gdrive ||= Google::Drive.new).file(@gsheet_path)
    unless @file
      ChatClient.log "Google Drive file <b>#{@gsheet_path}</b> not found.", color: 'red', notify: 1
      return
    end

    begin
      buf = @file.spreadsheet_csv
    rescue GoogleDrive::Error => e
      puts "Error on file: #{@gsheet_path}, #{e}"
      throw e
    end
    CSV.open(@csv_path, 'wb') do |csv|
      columns = nil
      CSV.parse(buf, headers: true) do |row|
        unless columns
          # Determine the set of columns to be output.
          columns = row.headers
          unless @include_columns.empty?
            columns &= @include_columns
          end
          columns -= @exclude_columns
          # Output the columns.
          csv << columns
        end
        csv << columns.map {|i| row[i]}
      end
    end

    File.utime(File.atime(@csv_path), @file.mtime, @csv_path)

    ChatClient.log "Downloaded <b>#{@gsheet_path}</b> (<b>#{File.size(@csv_path)}</b> btyes) from Google Drive."

    return @csv_path
  end
end

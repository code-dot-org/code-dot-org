require 'cdo/google_drive'
#require src_dir 'database'

class CsvToSqlTable

  def initialize(path, params={})
    @db = params[:db]||DB
    @path = path
    @table = File.basename(@path, File.extname(@path)).gsub('-','_').to_sym
  end

  def up_to_date?()
    seed = DB[:seed_info].where(table:@table.to_s).first
    return false unless seed

    mtime = File.mtime(@path)
    mtime.to_s == seed[:mtime].to_s
  end

  def import()
    import! unless up_to_date?
    @table
  end

  def import!()
    HipChat.log "Importing <b>#{@table}</b> table from <b>#{File.basename(@path)}</b>"

    # Starting with 1 means the first item's ID is 2 which matches the id to the line number of the item.
    at = 1

    CSV.open(@path, 'rb') do |csv|
      table, columns = create_table(csv.shift)
      while(values = csv.shift)
        table.insert(hash_from_keys_and_values(columns, values).merge({id:at+=1}))
      end
    end

    set_table_mtime(File.mtime(@path))

    HipChat.log "Imported <b>#{at-1}</b> rows into <b>#{@table}</b>"

    @table
  end

  private

  def hash_from_keys_and_values(keys, values)
    h={}
    for i in 0..keys.count-1
      key_name = keys[i].to_s
      case key_name[key_name.rindex('_')..-1]
      when '_b'
        value = values[i].to_bool
      when '_f'
        value = values[i].to_f
      when '_i'
        value = values[i].to_i
      else
        value = values[i]
      end

      h[keys[i]] = value
    end
    h
  end

  def create_table(columns)
    schema = columns.map{|column| column_name_to_schema(column)}

    DB.create_table!(@table, charset:'utf8') do
      primary_key :id

      schema.each do |column|
        add_column column[:name], type:column[:type]
        index column[:name] if column[:index]
        unique column[:name] if column[:unique]
      end
    end

    [DB[@table], schema.map{|i| i[:name]}]
  end

  def column_name_to_schema(name)
    i = name.rindex('_')

    if name.ends_with?('!') or name.ends_with?('*')
      type_flag = name[-1..-1]
      name = name[0..-2]
    end

    type_info = name[i..-1]

    type = {
      '_b'=>{type:'boolean'},
      '_dt'=>{type:'datetime'},
      '_f'=>{type:'float'},
      '_i'=>{type:'integer'},
      '_s'=>{type:'varchar(255)'},
      '_ss'=>{type:'varchar(255)'},
      '_t'=>{type:'text'},
    }[type_info] || {type:'varchar(255)'}

    type = type.merge(unique:true) if type_flag == '!'
    type = type.merge(index:true) if type_flag == '*'

    type.merge({name:name.to_sym})
  end

  def set_table_mtime(mtime)
    seed_info = DB[:seed_info]
    if seed = seed_info.where(table:@table.to_s).first
      seed_info.where(table:@table.to_s).update(mtime:mtime)
    else
      seed_info.insert(table:@table.to_s, mtime:mtime)
    end
  end

end

class GSheetToCsv

  @@gdrive = nil

  def initialize(path)
    @gsheet_path, settings_yml = IO.read(path).strip.split("\n", 2)
    settings = YAML.load(settings_yml.to_s) || {}
    @exclude_columns = settings['exclude_columns'] || []
    @csv_path = File.join(File.dirname(path), File.basename(path, File.extname(path)) + '.csv')
    @file = nil
  end

  def up_to_date?()
    @file ||= (@@gdrive ||= Google::Drive.new).file(@gsheet_path)
    unless @file
      HipChat.log "Google Drive file <b>#{@gsheet_path}</b> not found.", color:'red', notify:1
      return
    end

    begin
      mtime = @file.mtime
      ctime = File.mtime(@csv_path).utc if File.file?(@csv_path)
      return mtime.to_s == ctime.to_s
    rescue GoogleDrive::Error => e
      HipChat.log "<p>Error getting modified time for <b>#{@gsheet_path}<b> from Google Drive.</p><pre><code>#{e.message}</code></pre>", color:'yellow'
      true # Assume the current thing is up to date.
    end
  end

  def import()
    import! unless up_to_date?
    @csv_path
  end

  def import!()
    HipChat.log "Downloading <b>#{@gsheet_path}</b> from Google Drive."

    @file ||= (@@gdrive ||= Google::Drive.new).file(@gsheet_path)
    unless @file
      HipChat.log "Google Drive file <b>#{@gsheet_path}</b> not found.", color:'red', notify:1
      return
    end

    buf = @file.spreadsheet.export_as_string('csv')
    if @exclude_columns.empty?
      IO.write(@csv_path, buf)
    else
      CSV.open(@csv_path, 'wb') do |csv|
        columns = nil
        CSV.parse(buf, headers:true) do |row|
          unless columns
            columns = row.headers - @exclude_columns
            csv << columns
          end
          csv << columns.map{|i| row[i]}
        end
      end
    end

    File.utime(File.atime(@csv_path), @file.mtime, @csv_path)

    HipChat.log "Downloaded <b>#{@gsheet_path}</b> (<b>#{File.size(@csv_path)}</b> btyes) from Google Drive."

    return @csv_path
  end

end

$gdrive_ = nil

namespace :seed do

  def csv_smart_value(value)
    return true if value == 'TRUE'
    return false if value == 'FALSE'
    return Date.strptime(value.to_s.strip, '%m/%d/%Y') if value.to_s.strip =~ /^\d{1,2}\/\d{1,2}\/\d{4}$/
    return value
  end

  def import_csv_into_table(path, table)
    db = DB[table]

    db.delete

    auto_id = db.columns.include?(:id)

    count = 0
    CSV.foreach(path, headers:true) do |data|
      record = {}
      db.columns.each{|column| record[column] = csv_smart_value(data[column.to_s])}

      count += 1
      record[:id] = count if auto_id

      db.insert record
    end
    puts "#{count} items imported into #{table} from '#{path}'"
  end

  def stub_path(table)
    cache_dir(".#{table.to_s}-imported")
  end

  def gdrive()
    $gdrive_ ||= Google::Drive.new
  end

  sync_tasks = []

  imports = {
    beyond_tutorials:'Data/HocBeyondTutorials.gsheet',
    tutorials:'Data/HocTutorials.gsheet',
    uk_tutorials:'Data/UkHocTutorials.gsheet',
  }

  imports.each_pair do |table,path|
    extname = File.extname(path)
    if extname == '.gsheet'
      gsheet = path[0..-(extname.length+1)]
      path = "cache/#{path.gsub(File::SEPARATOR,'_')}.csv"
      extname = File.extname(path)

      sync = "sync:#{table}"
      task sync do
        if file = gdrive.file(gsheet)
          mtime = file.mtime
          ctime = File.mtime(path).utc if File.file?(path)
          unless mtime.to_s == ctime.to_s
            puts "gdrive #{path}"
            file.spreadsheet.export_as_file(path, nil, 0)
            File.utime(File.atime(path), mtime, path)
          end
        else
          HipChat.log "Google Drive file <b>#{gsheet}</b> not found.", color:'red', notify:1
        end
      end
      sync_tasks << sync
    end

    task table do
      import_csv_into_table(path, table)
    end

    stub = stub_path(table)
    file stub => [path] do
      import_csv_into_table(path, table)
      touch stub
    end
  end

  task :migrate => imports.keys.map{|i| stub_path(i)} do
    Dir.glob(pegasus_dir('data/*.csv')){|i| CsvToSqlTable.new(i).import}
  end

  task :reset => imports.keys do
    Dir.glob(pegasus_dir('data/*.csv')){|i| CsvToSqlTable.new(i).import!}
  end

  task :sync_v3 do
    Dir.glob(pegasus_dir('data/*.gsheet')){|i| GSheetToCsv.new(i).import}
  end

  task :sync => [:sync_v3, sync_tasks, :migrate].flatten do
  end

  task :help do
    puts "seed:help - display this message"
    puts "seed:migrate - import any modified seeds"
    puts "seed:reset - drop and import all seeds"
    puts "seed:sync - update remote seeds and import any modified"
  end
end

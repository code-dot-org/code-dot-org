require 'csv'
require 'cdo/chat_client'
require 'cdo/google/drive'

class GSheetToCsv
  @@gdrive = nil

  def initialize(path)
    @gsheet_path, settings_yml = File.read(path).strip.split("\n", 2)
    settings = YAML.safe_load(settings_yml.to_s) || {}
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
    rescue GoogleDrive::Error => exception
      ChatClient.log "<p>Error getting modified time for <b>#{@gsheet_path}<b> from Google Drive.</p><pre><code>#{exception.message}</code></pre>", color: 'yellow'
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
    rescue GoogleDrive::Error => exception
      puts "Error on file: #{@gsheet_path}, #{exception}"
      throw exception
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

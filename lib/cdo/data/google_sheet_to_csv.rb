require 'csv'
require 'cdo/google/drive'

class GSheetToCsv
  @@gdrive = nil

  def initialize(path)
    @gsheet_id, settings_yml = File.read(path).strip.split("\n", 2)
    settings = YAML.safe_load(settings_yml.to_s) || {}
    @include_columns = settings['include_columns'] || []
    @exclude_columns = settings['exclude_columns'] || []
    @csv_path = File.join(File.dirname(path), File.basename(path, File.extname(path)) + '.csv')
    @file = nil
  end

  def up_to_date?
    @file ||= (@@gdrive ||= Google::Drive.new).file_by_id(@gsheet_id)

    mtime = @file.mtime
    ctime = File.mtime(@csv_path) if File.file?(@csv_path)
    return mtime.to_s == ctime.to_s
  end

  def import
    import! unless up_to_date?
    @csv_path
  end

  def import!
    CDO.log.info "Downloading Google File with id: #{@gsheet_id} from Google Drive."

    @file ||= (@@gdrive ||= Google::Drive.new).file(@gsheet_id)

    begin
      buf = @file.spreadsheet_csv
    rescue GoogleDrive::Error => exception
      CDO.log.info "Error on file with id: #{@gsheet_id}, #{exception}"
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

    CDO.log.info "Downloaded Google file with id: #{@gsheet_id}  (#{File.size(@csv_path)} btyes) from Google Drive."

    return @csv_path
  end
end

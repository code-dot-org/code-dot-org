require 'google_drive'
require 'cdo/chat_client'

module Google
  class Drive
    BATCH_UPDATE_SIZE = 1000

    class File
      def initialize(session, file)
        @session = session
        @file = file
        $log.debug "Google Drive file opened (key: #{@file.key})"
      end

      def raw_file
        @file
      end

      def key
        @file.key
      end

      def mtime
        @file.api_file.modified_time.to_time
      end

      def spreadsheet
        @session.spreadsheet_by_key(@file.key)
      end

      def spreadsheet_csv
        raw_file.export_as_string('text/csv')
      end
    end

    def raw_session
      @session
    end

    def initialize(params={})
      $log.debug 'Establishing Google Drive session'
      @session = if params[:service_account_key]
                   GoogleDrive::Session.from_service_account_key params[:service_account_key]
                 else
                   GoogleDrive.saved_session(deploy_dir('.gdrive_session'))
                 end
    end

    def file(path)
      file = @session.file_by_title(path_to_title_array(path))
      return nil if file.nil?
      Google::Drive::File.new(@session, file)
    rescue GoogleDrive::Error => e
      ChatClient.log "<p>Error syncing <b>#{path}<b> from Google Drive.</p><pre><code>#{e.message}</code></pre>", color: 'yellow'
      return nil
    end

    def folder(path)
      collection = @session.collection_by_title(path_to_title_array(path))
      return nil if collection.nil?
      collection
    end

    def upload_file_to_folder(src_path, target_path)
      temp_name = SecureRandom.uuid.to_s
      target_name = ::File.basename(target_path)
      target_folder = ::File.dirname(target_path)

      $log.debug "Uploading '#{src_path}' as '/#{temp_name}'"
      file = @session.upload_from_file(src_path, temp_name)

      $log.debug "Moving '/#{temp_name}' to '#{target_folder}/#{temp_name}'"
      folder = self.folder(target_folder)
      folder.add(file)
      @session.root_collection.remove(file)

      existing_file = self.file(target_path)
      unless existing_file.nil?
        $log.debug "Removing existing '#{target_path}'"
        folder.remove(existing_file.raw_file)
      end

      $log.debug "Renaming '#{temp_name}' to '#{target_name}' in '#{target_folder}'"
      file.title = target_name
    end

    def add_sheet_to_spreadsheet(data, spreadsheet_path, sheet_name)
      target_name = ::File.basename(spreadsheet_path)
      target_folder = ::File.dirname(spreadsheet_path)
      folder = self.folder(target_folder)
      spreadsheet = @session.spreadsheet_by_title(spreadsheet_path)
      unless spreadsheet
        spreadsheet = @session.create_spreadsheet(target_name)
        folder.add(spreadsheet)
      end
      worksheet = spreadsheet.worksheet_by_title(sheet_name)
      worksheet ||= spreadsheet.add_worksheet(sheet_name, 500)
      worksheet.delete_rows(1, worksheet.num_rows)
      worksheet.update_cells(1, 1, data)
      worksheet.save
    end

    # Update a sheet (tab) in an _existing_ Google Sheets document, completely overwriting
    # its contents, and creating it if needed.
    #
    # @param [Array.<Array>] data The rows to write into the document
    # @param [String] document_key The identifier for the google sheet to be updated, as found
    #   in its share URL.
    #   e.g. "f0SdU35KaAv3LE7IYhHkFCb0Y6fZTGgk1GIa1LtO8uYx"
    # @param [String] sheet_name The full name of the sheet/tab within the document to be
    #   created/updated.
    def update_sheet(data, document_key, sheet_name)
      document = @session.spreadsheet_by_key(document_key)
      raise "Could not find document #{document_key}" unless document
      worksheet = document.worksheet_by_title(sheet_name)
      worksheet ||= document.add_worksheet(sheet_name, 500)
      worksheet.delete_rows(1, worksheet.num_rows)
      current_index = 1
      data.each_slice(BATCH_UPDATE_SIZE) do |data_batch|
        worksheet.update_cells(current_index, 1, data_batch)
        current_index += BATCH_UPDATE_SIZE
        worksheet.save
      end
    end

    # Returns an ACL object for a spreadsheet document
    # @param [String] document_key
    # @return [GoogleDrive::Acl] ACL object that contains an array of GoogleDrive::AclEntry
    def get_spreadsheet_acl(document_key)
      document = @session.spreadsheet_by_key(document_key)
      raise "Could not find document #{document_key}" unless document
      document.acl
    end

    private

    def path_to_title_array(path)
      titles = path.split(::File::SEPARATOR).map {|x| x == '' ? ::File::SEPARATOR : x}
      titles.unshift 'Pegasus'
      titles
    end
  end
end

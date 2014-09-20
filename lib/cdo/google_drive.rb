require 'google_drive'
require 'cdo/hip_chat'

module Google

  class Drive

    class File

      def initialize(session,file)
        @session = session
        @file = file
        $log.debug "Google Drive file opened (key: #{@file.key})"
      end

      def raw_file()
        @file
      end

      def key()
        @file.key
      end

      def mtime()
        attrs = @file.document_feed_entry.children
        mtime = attrs.at('updated') || attrs.at('published')
        Time.parse(mtime)
      end

      def spreadsheet()
        @session.spreadsheet_by_key(@file.key)
      end

    end

    def raw_session()
      @session
    end

    def initialize(params={})
      $log.debug 'Establishing Google Drive session'
      @session = GoogleDrive.saved_session(deploy_dir('.gdrive_session'))
    end

    def file(path)
      begin
        file = @session.file_by_title(path_to_title_array(path))
        return nil if file.nil?
        Google::Drive::File.new(@session, file)
      rescue GoogleDrive::Error => e
        HipChat.log "<p>Error syncing <b>#{path}<b> from Google Drive.</p><pre><code>#{e.message}</code></pre>", color:'yellow'
        return nil
      end
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

    private

    def path_to_title_array(path)
      titles = path.split(::File::SEPARATOR).map {|x| x=='' ? ::File::SEPARATOR : x}
      titles.unshift 'Pegasus'
      titles
    end

  end

end

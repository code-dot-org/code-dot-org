module Widget2Helper
  WIDGET2_BASE_DIRECTORY = "#{Rails.root}/config/widget2".freeze
  NEW_WEBLAB2_PROJECT_LEVEL_ID = Level.find_by_name("New Web Lab 2 Project")&.id

  # Retrieve widget2 sources from the file system.
  def get_widget2_sources(widget2_id)
    widget2_directory = get_widget2_directory(widget2_id)
    source_file_paths = Dir.glob(File.join(widget2_directory, "*"))

    sources = source_file_paths.map do |file_path|
      {
        name: File.basename(file_path),
        contents: File.read(file_path)
      }
    end

    files = {}
    sources.each_with_index do |source, index|
      use_index = index + 1
      files[use_index.to_s] = {
        id: use_index.to_s,
        name: source[:name],
        contents: source[:contents],
        active: use_index == 1,
        folderId: "0"
      }
    end

    {
      folders: {},
      files: files,
      openFiles: files.keys
    }
  end

  # Save widget2 sources to the file system.
  def set_widget2_sources(widget2_id, start_sources)
    widget2_directory = File.join(WIDGET2_BASE_DIRECTORY, widget2_id.to_s)

    FileUtils.mkdir_p(widget2_directory)

    files = start_sources && start_sources[:files]
    if files.present?
      files.each do |_, file|
        name = file[:name]
        contents = file[:contents]
        next unless name && contents

        path = File.join(widget2_directory, name)
        File.write(path, contents)
      end
    end
  end

  # Returns a list of available widget2 IDs.
  def get_widget2_ids
    source_directories_list = Dir.glob(File.join(WIDGET2_BASE_DIRECTORY, "*"))

    source_directories_list.map do |directory|
      File.basename(directory)
    end
  end

  # Returns the edit URL for a widget2.
  private def get_widget2_edit_url(widget2_id)
    "/levels/#{NEW_WEBLAB2_PROJECT_LEVEL_ID}/edit_blocks/widget2_sources?widget2=#{widget2_id}"
  end

  private def get_widget2_directory(widget2_id)
    File.join(WIDGET2_BASE_DIRECTORY, widget2_id.to_s)
  end
end

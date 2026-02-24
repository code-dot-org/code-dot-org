module Widget2Helper
  WIDGET2_BASE_DIRECTORY = "#{Rails.root}/config/widget2".freeze

  # Retrieve widget2 sources from the file system.
  def get_widget2_sources(widget2_id)
    widget2_directory = get_widget2_directory(widget2_id)
    source_files_list = Dir.glob(File.join(widget2_directory, "*"))

    source_files = []
    source_files_list.each do |file_path|
      file_name = File.basename(file_path)
      file_contents = File.read(file_path)
      source_files.push({name: file_name, contents: file_contents})
    end

    files_hash = {}
    source_files.each_with_index do |source_file, index|
      use_index = index + 1
      files_hash[use_index.to_s] = {
        id: use_index.to_s,
        name: source_file[:name],
        contents: source_file[:contents],
        active: use_index == 1,
        folderId: 0
      }
    end

    {
      folders: {},
      files: files_hash,
      openFiles: files_hash.keys
    }
  end

  # Save widget2 sources to the file system.
  def set_widget2_sources(widget2_id, start_sources)
    widget2_directory = File.join(WIDGET2_BASE_DIRECTORY, widget2_id.to_s)

    FileUtils.mkdir_p(widget2_directory)

    files_hash = start_sources && start_sources[:files]
    if files_hash.present?
      files_hash.each do |_id, file|
        puts file
        name = file[:name]
        contents = file[:contents]
        next unless name && contents

        path = File.join(widget2_directory, name)
        File.write(path, contents)
      end
    end
  end

  private def get_widget2_directory(widget2_id)
    File.join(WIDGET2_BASE_DIRECTORY, widget2_id.to_s)
  end
end

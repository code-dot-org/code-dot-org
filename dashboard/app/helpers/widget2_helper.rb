module Widget2Helper
  WIDGET2_BASE_DIRECTORY = "#{Rails.root}/config/widget2".freeze

  # Ids and source names are single path segments: a separator or ".." would escape the
  # widget2 tree.
  WIDGET2_ID_PATTERN = /\A[a-z0-9][a-z0-9_-]*\z/
  WIDGET2_SOURCE_NAME_PATTERN = /\A[A-Za-z0-9][A-Za-z0-9_-]*\.(html|css|js|json)\z/

  def valid_widget2_id?(widget2_id)
    WIDGET2_ID_PATTERN.match?(widget2_id.to_s)
  end

  # Retrieve widget2 sources from the file system.  Returns nil when there are none to
  # read, so that a new widget2 opens on the level's own start sources.
  def get_widget2_sources(widget2_id)
    return nil unless valid_widget2_id?(widget2_id)

    widget2_directory = get_widget2_directory(widget2_id)
    source_file_paths = Dir.glob(File.join(widget2_directory, "*"))
    return nil if source_file_paths.empty?

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

  # Save widget2 sources to the file system.  Raises ArgumentError unless the id and
  # every source file name are ones we will write.
  def set_widget2_sources(widget2_id, start_sources)
    widget2_directory = get_widget2_directory(widget2_id)
    files = start_sources && start_sources[:files]

    # Check every name before writing any, so a rejected save writes nothing.
    sources = []
    files&.each do |_, file|
      name = file[:name]
      contents = file[:contents]
      next unless name && contents
      unless WIDGET2_SOURCE_NAME_PATTERN.match?(name)
        raise ArgumentError, "Invalid widget2 source file name: #{name.inspect}"
      end

      sources << [name, contents]
    end
    return if sources.empty?

    FileUtils.mkdir_p(widget2_directory)
    sources.each do |name, contents|
      File.write(File.join(widget2_directory, name), contents)
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
    check_widget2_id!(widget2_id)
    new_weblab2_project_level_id = Level.find_by_name("New Web Lab 2 Project")&.id
    "/levels/#{new_weblab2_project_level_id}/edit_blocks/widget2_sources?widget2=#{widget2_id}"
  end

  private def get_widget2_directory(widget2_id)
    check_widget2_id!(widget2_id)
    File.join(WIDGET2_BASE_DIRECTORY, widget2_id.to_s)
  end

  private def check_widget2_id!(widget2_id)
    return if valid_widget2_id?(widget2_id)
    raise ArgumentError, "Invalid widget2 id: #{widget2_id.inspect}"
  end
end

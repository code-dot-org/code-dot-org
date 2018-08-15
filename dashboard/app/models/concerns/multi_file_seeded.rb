# Utility methods for seeding models from (at least) one file per record
# This concern assumes that each record has a unique 'name', which is used as
# the filename.
# Models that use this concern must provide the following
#   Class constants:
#     CONFIG_DIRECTORY - Directory in dashboard/config under which to write files.
#       E.g. 'blocks' puts everything under dashboard/config/blocks/...
#     SUBDIRECTORY_ATTRIBUTES - List of attributes to read to construct the
#       subdirectory for a record's file. E.g. [:level_type] means that blocks
#       with a level_type of 'GameLabJr' will be saved under
#       dashboard/config/blocks/GameLabJr/..., while [:level_type, :category]
#       would put a block with category 'Sprites' under
#       dashboard/config/blocks/GameLabJr/Sprites/...
#     EXTENSION - File extension used for record files
#   Class methods:
#     properties_from_file(path, file_content) - Returns a hash of properties
#       that will be assigned to the record
#   Instance methods:
#     file_content - Retruns a string that will be written to the record file
# Models that use this concern may provide the following additional instance
# methods to support more than one file per record
#   write_additional_files
#   delete_additional_files

module MultiFileSeeded
  extend ActiveSupport::Concern

  included do
    before_save :write_file
    before_destroy :delete_file
    validates_presence_of :name
    validates_uniqueness_of :name
  end

  def directory(old=false)
    directories = ['config', self.class::CONFIG_DIRECTORY]
    directories += self.class::SUBDIRECTORY_ATTRIBUTES.map do |attr|
      old && attribute_was(attr) || attributes[attr.to_s]
    end
    Rails.root.join(*directories)
  end

  def file_path(old=false)
    extension = self.class::EXTENSION
    Rails.root.join "config", directory(old), "#{old && name_was || name}.#{extension}"
  end

  def file_path_was
    file_path(true)
  end

  def write_file
    delete_file if file_path != file_path_was
    FileUtils.mkdir_p directory
    File.write file_path, file_content

    write_additional_files if respond_to? :write_additional_files
  end

  def delete_file
    File.delete file_path_was if File.exist? file_path_was
    delete_additional_files if respond_to? :delete_additional_files
  end

  module ClassMethods
    def load_records(blob="config/#{self::CONFIG_DIRECTORY}/**/*.#{self::EXTENSION}")
      removed_records = all.pluck(:name)
      Dir.glob(Rails.root.join(blob)).each do |path|
        removed_records -= [load_record(path)]
      end
      where(name: removed_records).destroy_all
    end

    def load_record(file_path)
      properties = properties_from_file(file_path, File.read(file_path))
      record = find_or_initialize_by(name: properties[:name])
      record.update! properties
      record.name
    end
  end
end

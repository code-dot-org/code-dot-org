# == Schema Information
#
# Table name: datablock_storage_library_manifest
#
#  id               :bigint           not null, primary key
#  library_manifest :json
#  singleton_guard  :integer          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_datablock_storage_library_manifest_on_singleton_guard  (singleton_guard) UNIQUE
#
# A one-row table storing a singleton JSON `library_manifest`` that
# describes all Data Library datasets and categories:
#
# library_manifest = {
#   categories: [
#     {
#       datasets: [
#         '100 Birds of the World',
#         'Cats',
#         'Dogs',
#       ],
#       name: 'Animals',
#       published: true,
#     },
#   ],
#   tables: [
#     {
#       description:
#         'Data and images about 100 different species of birds around the world',
#       docUrl: 'https://studio.code.org/data_docs/100-birds/',
#       name: '100 Birds of the World',
#       published: true,
#     },
#   ],
# };
#
# See: `DatasetController`(Ruby) and `DatablockStorage.getLibraryManifest` (JS)
class DatablockStorageLibraryManifest < ApplicationRecord
  self.table_name = 'datablock_storage_library_manifest'
  
  validates_inclusion_of :singleton_guard, in: [0]
  validate :validate_library_manifest

  after_initialize :set_default_library_manifest, if: :new_record?

  def self.instance
    first_or_create!(singleton_guard: 0)
  end

  validate :library_manifest

private

  def validate_library_manifest
    unless library_manifest.is_a?(Hash)
      errors.add(:library_manifest, "must be a JSON object")
      return
    end

    unless library_manifest.key?('categories') && library_manifest['categories'].is_a?(Array)
      errors.add(:library_manifest, "must have a 'categories' array")
    end

    unless library_manifest.key?('tables') && library_manifest['tables'].is_a?(Array)
      errors.add(:library_manifest, "must have a 'tables' array")
    end
  end

  def set_default_library_manifest
    self.library_manifest ||= { 'categories' => [], 'tables' => [] }
  end
end

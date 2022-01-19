# == Schema Information
#
# Table name: blocks
#
#  id          :integer          not null, primary key
#  name        :string(255)      not null
#  pool        :string(255)      default(""), not null
#  category    :string(255)
#  config      :text(65535)
#  helper_code :text(65535)
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  deleted_at  :datetime
#
# Indexes
#
#  index_blocks_on_deleted_at     (deleted_at)
#  index_blocks_on_pool_and_name  (pool,name) UNIQUE
#

class Block < ApplicationRecord
  include MultiFileSeeded

  DEFAULT_POOL = 'Vanilla'.freeze

  def self.all_pool_names
    @@all_pool_names ||= Block.distinct.pluck(:pool)
  end

  def self.for(should_localize, *types)
    types = types.to_set.add(DEFAULT_POOL)
    types.map {|type| Block.load_and_cache_by_pool(type, should_localize)}.flatten.compact
  end

  def self.load_and_cache_by_pool(pool, should_localize)
    if Script.should_cache? && !Block.all_pool_names.include?(pool)
      return nil
    end

    locale = should_localize ? I18n.locale : I18n.default_locale
    Rails.cache.fetch("blocks/#{pool}/#{locale}", force: !Script.should_cache?) do
      Block.where(pool: pool).map {|b| b.block_options(should_localize)}
    end
  end

  def block_options(should_localize)
    options = {
      name: name,
      pool: pool,
      category: category,
      config: JSON.parse(config),
      helperCode: helper_code,
    }

    return options unless should_localize

    block_text = options[:config]["blockText"]
    unless block_text.blank?
      block_text_translation = I18n.t(
        "text",
        scope: [:data, :blocks, name],
        default: nil,
        smart: true
      )
      options[:config]["blockText"] = block_text_translation unless block_text_translation.blank?
    end
    arguments = options[:config]["args"]
    unless arguments.blank?
      arguments.each do |argument|
        next if argument["options"].blank?
        argument["options"]&.each_with_index do |option, i|
          # Options come in arrays representing key,value pairs, which will
          # ultimately determine the display of the dropdown.
          # When only one element is in the array, it represents both the key
          # and the value.
          option_value = option.length > 1 ? option[1] : option[0]

          # Get the translation from the value
          option_translation = I18n.t(
            option_value,
            scope: [:data, :blocks, name, :options, argument['name']],
            default: nil,
            smart: true
          )
          # Update the key (the first element) with the new translated value
          argument["options"][i][0] = option_translation unless option_translation.blank?
        end
      end
      options[:config]["args"] = arguments
    end
    options
  end

  CONFIG_DIRECTORY = 'blocks'
  SUBDIRECTORY_ATTRIBUTES = [:pool]
  EXTENSION = 'json'

  def file_content
    JSON.pretty_generate(
      {
        category: category,
        config: JSON.parse(config),
      }
    )
  end

  def self.properties_from_file(path, content)
    block_config = JSON.parse(content)
    js_path = Pathname.new(path).sub_ext('.js')
    helper_code = File.exist?(js_path) ? File.read(js_path) : nil
    {
      name: File.basename(path, ".#{EXTENSION}"),
      pool: File.basename(File.dirname(path)),
      category: block_config['category'],
      config: block_config['config'].to_json,
      helper_code: helper_code,
    }
  end

  def write_additional_files
    if helper_code.try(:present?)
      File.write js_path, helper_code
    else
      delete_additional_files
    end
  end

  def delete_additional_files
    File.delete js_path_was if File.exist? js_path_was
  end

  def js_path(old=false)
    Pathname.new(file_path(old)).sub_ext('.js')
  end

  def js_path_was
    js_path(true)
  end
end

# Generates Common Cartridge v1.3 for a course (unit group)
# @see https://www.imsglobal.org/activity/common-cartridge
class UnitGroup::CommonCartridgeGenerator
  include MultiVersionCommonCartridge

  CC_VERSION = CartridgeVersions::CC_1_3_0.freeze

  def initialize(unit_group = UnitGroup.find_by(name: 'csp-2020'), locale: I18n.default_locale)
    @unit_group = unit_group
    @locale = locale
  end

  def call
    # ug = UnitGroup.find_by(name: 'csp-2020')
    # unit = UnitGroup.find_by(name: 'csp-2020').default_units.first
    # require '/Users/av/Projects/code-dot-org/dashboard/lib/services/unit_group/common_cartridge_generator.rb'
    # UnitGroup::CommonCartridgeGenerator.new.call

    I18n.with_locale(locale) do
      cartridge.manifest.organization_identifier = 'LearningModules'
      cartridge.manifest.identifier = unit_group.name.parameterize
      cartridge.manifest.set_title(unit_group.localized_title, language: locale)
      cartridge.manifest.description = unit_group.localized_description_short

      unit_group.default_unit_group_units.includes(script: :lessons).each do |unit_group_unit|
        unit = unit_group_unit.script

        cartridge.items << Item.new.tap do |unit_item|
          unit_item.identifier = unit.name.parameterize
          unit_item.title = unit.title_for_display

          add_overview(unit_group_unit, unit_item)
          add_overview_pdf(unit_group_unit, unit_item)
          add_overview_link(unit_group_unit, unit_item)

          unit.lessons.select(&:has_lesson_plan).sort_by(&:relative_position).each do |lesson|
            unit_item.children << Item.new.tap do |lesson_item|
              lesson_item.identifier = lesson.key.parameterize
              lesson_item.title = lesson.localized_title

              add_lesson_resource(lesson, lesson_item)
            end
          end
        end
      end

      cartridge.all_resources << Resources::CourseSettings.new.tap do |course_settings_resource|
        course_settings_resource.cartridge = cartridge
      end

      raise 'not finalized' unless cartridge_writer.finalize

      cartridge_writer.write_in_dir(unit_group.name.parameterize)
      # cartridge_writer.write_to_zip("#{unit_group.name.parameterize}.zip")

      nil
    end
  end

  class Resources::CourseSettings < Resources::Resource
    attr_accessor :cartridge
  end

  class Writers::CourseSettings < Writers::ResourceWriter
    def create_files(out_dir)
      {
        canvas_export_path => canvas_export_content,
        files_meta_path => files_meta_content,
        media_tracks_path => media_tracks_content,
        module_meta_path => module_meta_content,
      }.each do |file_path, file_content|
        file_path = File.join(out_dir, file_path)
        FileUtils.mkdir_p File.dirname(file_path)
        File.write(file_path, file_content.force_encoding('UTF-8'))
      end
    end

    def resource_element
      CommonCartridge::Elements::Resources::Resource.new.tap do |element|
        element.identifier = 'course_settings'
        element.type = 'associatedcontent/imscc_xmlv1p1/learning-application-resource'
        element.href = canvas_export_path
        element.files = [
          CommonCartridge::Elements::Resources::File.new(href: files_meta_path),
          CommonCartridge::Elements::Resources::File.new(href: media_tracks_path),
          CommonCartridge::Elements::Resources::File.new(href: module_meta_path),
        ]
      end
    end

    private

    def canvas_export_path
      'course_settings/canvas_export.txt'
    end

    def canvas_export_content
      <<~TXT
        Q: What did the panda say when he was forced out of his natural habitat?
        A: This is un-BEAR-able
      TXT
    end

    def files_meta_path
      'course_settings/files_meta.xml'
    end

    def files_meta_content
      Nokogiri::XML::Builder.new(encoding: 'UTF-8') do |xml|
        xml.fileMeta(
          'xmlns' => 'http://canvas.instructure.com/xsd/cccv1p0',
          'xmlns:xsi' => 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation' => 'http://canvas.instructure.com/xsd/cccv1p0 https://canvas.instructure.com/xsd/cccv1p0.xsd'
        )
      end.to_xml
    end

    def media_tracks_path
      'course_settings/media_tracks.xml'
    end

    def media_tracks_content
      Nokogiri::XML::Builder.new(encoding: 'UTF-8') do |xml|
        xml.media_tracks(
          'xmlns' => 'http://canvas.instructure.com/xsd/cccv1p0',
          'xmlns:xsi' => 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation' => 'http://canvas.instructure.com/xsd/cccv1p0 https://canvas.instructure.com/xsd/cccv1p0.xsd'
        )
      end.to_xml
    end

    def module_meta_path
      'course_settings/module_meta.xml'
    end

    def module_meta_content
      Nokogiri::XML::Builder.new(encoding: 'UTF-8') do |xml|
        xml.modules(
          'xmlns' => 'http://canvas.instructure.com/xsd/cccv1p0',
          'xmlns:xsi' => 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation' => 'http://canvas.instructure.com/xsd/cccv1p0 https://canvas.instructure.com/xsd/cccv1p0.xsd'
        ) do
          resource.cartridge.items.each.with_index(1) do |item, position|
            xml.module('identifier' => item.identifier) do
              xml.title item.title
              xml.workflow_state 'active'
              xml.position position.to_s
              xml.require_sequential_progress 'false'
              xml.locked 'false'

              xml.items do
                item.children.each.with_index(1) do |child_item, child_position|
                  case child_item.resource
                  when MultiVersionCommonCartridge::Resources::Page
                    xml.item('identifier' => child_item.identifier) do
                      xml.content_type 'WikiPage'
                      xml.workflow_state 'active'
                      xml.title child_item.title
                      xml.identifierref child_item.resource.identifier
                      xml.position child_position.to_s
                      xml.new_tab 'false'
                      xml.indent '0'
                    end
                  when MultiVersionCommonCartridge::Resources::PDF
                    xml.item('identifier' => child_item.identifier) do
                      xml.content_type 'Attachment'
                      xml.workflow_state 'active'
                      xml.title child_item.title
                      xml.identifierref child_item.resource.identifier
                      xml.position child_position.to_s
                      xml.new_tab 'false'
                      xml.indent '0'
                    end
                  when MultiVersionCommonCartridge::Resources::Link
                    xml.item('identifier' => child_item.identifier) do
                      xml.content_type 'ExternalUrl'
                      xml.workflow_state 'active'
                      xml.identifierref child_item.identifier
                      xml.title child_item.resource.title
                      xml.url child_item.resource.url
                      xml.position child_position.to_s
                      xml.new_tab 'false'
                      xml.indent '0'
                      xml.link_settings_json 'null'
                    end
                  end
                end
              end
            end
          end
        end
      end.to_xml
    end
  end

  class Resources::Page < Resources::Resource
    attr_accessor :content
  end

  class Writers::Page < Writers::ResourceWriter
    def create_files(out_dir)
      return if resource.content.blank?

      file_path = File.join(out_dir, resource_path)

      FileUtils.mkdir_p File.dirname(file_path)

      File.write(file_path, resource.content.force_encoding('UTF-8'))
    end

    def resource_element
      CommonCartridge::Elements::Resources::Resource.new.tap do |element|
        element.identifier = resource.identifier
        element.type = 'webcontent'
        element.href = resource_path
        element.files = [CommonCartridge::Elements::Resources::File.new(href: resource_path)]
      end
    end

    private

    def resource_path
      File.join('wiki_content', "#{resource.identifier}.html")
    end
  end

  class Resources::PDF < Resources::Resource
    attr_accessor :content
  end

  class Writers::PDF < Writers::ResourceWriter
    def create_files(out_dir)
      return if resource.content.blank?

      file_path = File.join(out_dir, resource_path)
      FileUtils.mkdir_p File.dirname(file_path)
      File.write(file_path, resource.content.force_encoding('UTF-8'))
    end

    def resource_element
      CommonCartridge::Elements::Resources::Resource.new.tap do |element|
        element.identifier = resource.identifier
        element.type = 'webcontent'
        element.href = resource_path
        element.files = [CommonCartridge::Elements::Resources::File.new(href: resource_path)]
      end
    end

    private

    def resource_path
      File.join('web_resources', "#{resource.identifier}.pdf")
    end
  end

  class Resources::Link < Resources::Resource
    attr_accessor :title, :url
  end

  class Writers::Link < Writers::ResourceWriter
    def create_files(out_dir)
      file_path = File.join(out_dir, resource_path)
      FileUtils.mkdir_p File.dirname(file_path)
      File.write(file_path, resource_content)
    end

    def resource_element
      CommonCartridge::Elements::Resources::Resource.new.tap do |element|
        element.identifier = resource.identifier
        element.type = 'imswl_xmlv1p1'
        element.files = [CommonCartridge::Elements::Resources::File.new(href: resource_path)]
      end
    end

    private

    def resource_path
      File.join('web_resources', "#{resource.identifier}.xml")
    end

    def resource_content
      Nokogiri::XML::Builder.new(encoding: 'UTF-8') do |xml|
        xml.webLink(
          'xmlns' => 'http://www.imsglobal.org/xsd/imsccv1p1/imswl_v1p1',
          'xmlns:xsi' => 'http://www.w3.org/2001/XMLSchema-instance',
          'xsi:schemaLocation' => 'http://www.imsglobal.org/xsd/imsccv1p1/imswl_v1p1 http://www.imsglobal.org/profile/cc/ccv1p1/ccv1p1_imswl_v1p1.xsd'
        ) do
          xml.title resource.title
          xml.url('href' => resource.url)
        end
      end.to_xml
    end
  end

  class Writers::Factory
    RESOURCE_WRITERS = MultiVersionCommonCartridge::Writers::Factory::RESOURCE_WRITERS.merge(
      MultiVersionCommonCartridge::Resources::Page => MultiVersionCommonCartridge::Writers::Page,
      MultiVersionCommonCartridge::Resources::PDF => MultiVersionCommonCartridge::Writers::PDF,
      MultiVersionCommonCartridge::Resources::Link => MultiVersionCommonCartridge::Writers::Link,
      MultiVersionCommonCartridge::Resources::CourseSettings => MultiVersionCommonCartridge::Writers::CourseSettings,
    )
  end

  private

  attr_reader :unit_group, :locale

  def cartridge
    @cartridge ||= Cartridge.new
  end

  def cartridge_writer
    @cartridge_writer ||= Writers::CartridgeWriter.new(cartridge, CC_VERSION)
  end

  def add_overview(unit_group_unit, unit_item)
    unit = unit_group_unit.script
    doc = nil

    if (unit_lesson_plan_resource = unit.resources.find {|r| r.key.include?('lesson_plans') && r.url.present?})
      doc = Nokogiri::HTML(URI(unit_lesson_plan_resource.get_localized_property(:url)).read)

      doc.xpath('//title')&.remove
      doc.xpath('//script')&.remove
      doc.xpath('//footer')&.remove
      doc.xpath('//meta')&.remove
      doc.xpath('//*[contains(@class, "alert")]')&.remove
      doc.xpath('//*[contains(@class, "header")]')&.remove
      doc.xpath('//*[contains(@class, "pacing-calendar")]')&.remove
      doc.xpath('//*[contains(@class, "breadcrumb")]')&.remove
      doc.xpath('//*[contains(@class, "resource-na")]')&.remove
      doc.xpath('//a[starts-with(@href, "/")]')&.remove_attribute('href')
    end

    return unless doc

    unit_item.children << Item.new.tap do |overview_item|
      overview_item.identifier = "#{unit.name.parameterize}-overview"
      overview_item.title = "#{I18n.t('unit_prefix', n: unit_group_unit.position)}: " \
                            "#{I18n.t('Overview', scope: [:data, :progressions], default: 'Overview')}"

      title_tag = Nokogiri::XML::Node.new('title', doc)
      title_tag.content = overview_item.title
      doc.at_css('head').add_child(title_tag)

      overview_item.resource = Resources::Page.new.tap do |page_resource|
        page_resource.identifier = "#{overview_item.identifier}-resource"

        identifier_tag = Nokogiri::XML::Node.new('meta', doc)
        identifier_tag['name'] = 'identifier'
        identifier_tag['content'] = page_resource.identifier
        doc.at_css('head').add_child(identifier_tag)

        page_resource.content = doc.to_html(indent: 2, encoding: 'UTF-8')
      end
    end
  end

  def add_overview_pdf(unit_group_unit, unit_item)
    unit = unit_group_unit.script

    unit_lesson_plan_resource = unit.resources.find {|r| r.key.include?('lesson_plans') && r.url.present?}
    return unless unit_lesson_plan_resource

    prf_file_url = "#{unit_lesson_plan_resource.get_localized_property(:url).remove(/\/$/)}.pdf"

    unit_item.children << Item.new.tap do |overview_item|
      overview_item.identifier = "#{unit.name.parameterize}-overview-pdf"
      overview_item.title = "#{I18n.t('unit_prefix', n: unit_group_unit.position)}: " \
                            "#{I18n.t('Overview', scope: [:data, :progressions], default: 'Overview')}"

      overview_item.resource = Resources::PDF.new.tap do |page_resource|
        page_resource.identifier = "#{overview_item.identifier}-resource"
        page_resource.content = URI(prf_file_url).read
      end
    end
  end

  def add_overview_link(unit_group_unit, unit_item)
    unit = unit_group_unit.script

    unit_lesson_plan_resource = unit.resources.find {|r| r.key.include?('lesson_plans') && r.url.present?}
    return unless unit_lesson_plan_resource

    url = unit_lesson_plan_resource.get_localized_property(:url)

    unit_item.children << Item.new.tap do |overview_item|
      overview_item.identifier = "#{unit.name.parameterize}-overview-link"
      overview_item.title = "#{I18n.t('unit_prefix', n: unit_group_unit.position)}: " \
                            "#{I18n.t('Overview', scope: [:data, :progressions], default: 'Overview')}"

      overview_item.resource = Resources::Link.new.tap do |page_resource|
        page_resource.identifier = "#{overview_item.identifier}-resource"
        page_resource.title = overview_item.title
        page_resource.url = url
      end
    end
  end

  def add_lesson_resource(lesson, lesson_item)
    return unless lesson.localized_lesson_plan

    doc = Nokogiri::HTML(URI(lesson.localized_lesson_plan).read)

    doc.xpath('//title')&.remove
    doc.xpath('//script')&.remove
    doc.xpath('//footer')&.remove
    doc.xpath('//meta')&.remove
    doc.xpath('//*[contains(@class, "alert")]')&.remove
    doc.xpath('//*[contains(@class, "header")]')&.remove
    doc.xpath('//*[contains(@class, "pacing-calendar")]')&.remove
    doc.xpath('//*[contains(@class, "breadcrumb")]')&.remove
    doc.xpath('//*[contains(@class, "resource-na")]')&.remove
    doc.xpath('//a[starts-with(@href, "/")]')&.remove_attribute('href')

    title_tag = Nokogiri::XML::Node.new('title', doc)
    title_tag.content = lesson_item.title
    doc.at_css('head').add_child(title_tag)

    lesson_item.resource = Resources::Page.new.tap do |page_resource|
      page_resource.identifier = "#{lesson.key.parameterize}-resource"

      identifier_tag = Nokogiri::XML::Node.new('meta', doc)
      identifier_tag['name'] = 'identifier'
      identifier_tag['content'] = page_resource.identifier
      doc.at_css('head').add_child(identifier_tag)

      page_resource.content = doc.to_html(indent: 2, encoding: 'UTF-8')
    end
  end
end

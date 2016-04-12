# Abstract class for DSL types which provide a standard set of content-definition methods.
class ContentDSL < BaseDSL
  def initialize
    super
    @hash.merge! options: {}
  end

  def title(text) @hash[:title] = text end
  def type(text) @hash[:type] = text end
  def submittable(text) @hash[:submittable] = text end

  # legacy
  def description(text) @hash[:content1] = text end
  def banner(text) @hash[:content2] = text end

  # new
  def content1(text) @hash[:content1] = text end
  def content2(text) @hash[:content2] = text end
  def content3(text) @hash[:content3] = text end

  # Markdown (i18n not yet supported)
  def markdown(md) @hash[:markdown] = md end
  def teacher_markdown(md) @hash[:teacher_markdown] = md end
  def pre_title(text) @hash[:pre_title] = text end
  def pre_body(text) @hash[:pre_body] = text end
  def pre_ani(text) @hash[:pre_ani] = text end

  def parse_output
    {name: @name, properties: @hash}
  end

  def method_missing(key, *args)
    @hash[:options] ||= {}
    @hash[:options][key.to_sym] = args.first
  end

  def i18n_strings
    strings = {}
    %i(
      title
      content1
      content2
      content3
      pre_title
      pre_body
      pre_ani
    ).each do |property|
      strings[@hash[property]] = @hash[property] unless @hash[property].blank?
    end
    {@name => strings}
  end
end

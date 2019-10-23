# Abstract class for DSL types which provide a standard set of content-definition methods.
class ContentDSL < LevelDSL
  def initialize
    super
    @hash.merge! options: {}
  end

  def title(text) @hash[:title] = text end
  def type(text) @hash[:type] = text end
  def submittable(text) @hash[:submittable] = text end
  def display_name(text) @hash[:display_name] = text end
  def display_as_unplugged(text) @hash[:display_as_unplugged] = text end
  def use_large_video_player(text) @hash[:use_large_video_player] = text end
  def hide_reference_area(text) @hash[:hide_reference_area] = text end
  def video_key(text) @hash[:video_key] = text end

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

  # Deprecated: This was used by three levels, each of which were using the identical
  # pre dialog.  That dialog has since been hardcoded, and this has become essentially
  # a bool, where the presence of any contents will result in our dialog (on match
  # levels only)
  def pre_title(text) @hash[:pre_title] = text end

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
    ).each do |property|
      strings[property] = @hash[property] unless @hash[property].blank?
    end
    strings.stringify_keys
  end
end

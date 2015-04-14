module ViewOptionsHelper
  AppViewOptions = Struct.new *%i(
    full_width
    no_header
    no_footer
    no_padding
    white_background
    callouts
    autoplay_video
  )
  # Sets custom options to be used by the view layer. The option hash is frozen once read.
  def view_options(opts = nil)
    @view_options ||= AppViewOptions.new
    if opts.blank?
      @view_options.freeze.to_h.delete_if { |k, v| v.nil? }
    else
      opts.each{|k, v| @view_options[k] = v}
    end
  end
end

# HACK! rake passes its command line options to minitest. This means
# that `rake --trace test` doesn't work. They are fixing this for
# Rails 5.0 (https://github.com/rails/rails/issues/24372) but here's a
# hack to make it work for us: creating a minitest plugin that just
# eats the -t and --trace options

module Minitest
  def self.plugin_trace_options(opts, options)
    opts.on "--trace", "Just ignore this so rake --trace works" do
      # nothing
    end

    opts.on "--t", "Just ignore this so rake -t works" do
      # nothing
    end
  end

  def self.plugin_trace_init(options)
    # don't actually do anything
  end
end

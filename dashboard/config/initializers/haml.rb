# Disable escaping HTML in interpolated strings, for backwards compatibility with Haml < 5 behavior.
# See: https://github.com/haml/haml/pull/984
Haml::Template.options[:escape_interpolated_html] = false

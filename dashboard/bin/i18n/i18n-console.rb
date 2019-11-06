require 'i18n'
require 'json'
# load_path                 # Announce your custom translation files
# locale                    # Get and set the current locale
# default_locale            # Get and set the default locale
# available_locales         # Permitted locales available for the application
# enforce_available_locales # Enforce locale permission (true or false)
# exception_handler         # Use a different exception_handler
# backend                   # Use a different backend
#
def find(key, locale)
  I18n.with_locale(locale) do 
    string = I18n.t(key, default: nil)
    if string
      return {key: "#{locale}.#{key}", string: string}
    else 
      return nil
    end
  end
end

def html_to_markdown(string) 
  puts string
  string = string.gsub(/(<strong>|<\/strong>|<b>|<\/b>)/, '**')
  string = string.gsub(/(<i>|<\/i>|<\/ i>)/, '*')
  # I decided strip the br tags because it's less than 1% of the HTML strings
  string = string.gsub(/(<br>|<br\/>)/, ' ')
  # start loop of converting <a>...</a> to markdown links [...](www...com)
  while has_anchor_tag? string 
    # TODO handle missing " or '?
    # remove orphan </a> tags
    string = strip_redundant_close_anchors string
    # find the start of an anchor
    anchor_open_start_index = (string =~ /(<a href=|<a herf=)/)
    # save the text before the anchor tag so we can reapply it later
    string_before_anchor = string[0...anchor_open_start_index]
    string = string[anchor_open_start_index..-1]
    # find the href= property so we can save its value
    href_start_index = (string =~ /("|')/) + 1
    string = string[href_start_index..-1]
    href_end_index = (string =~ /("|')/) - 1
    href = string[0..href_end_index]
    # find the closing '>' for the <a href=... > tag
    anchor_open_end_index = (string =~ />/)
    string = string[anchor_open_end_index + 1..-1]
    # find the closing </a> tag
    anchor_close_start_index = (string =~ /(<\/a>|<\/ a>|<a )/)
    anchor_close_start_index = -1 unless anchor_close_start_index
    # save the text between the open and close anchor tags <a> ... </a>
    anchor_text = string[0...anchor_close_start_index]
    string = string[anchor_close_start_index..-1]
    anchor_close_end_index = (string =~ />/)
    # remove the </a>
    string = string[anchor_close_end_index + 1..-1] if (string =~ /(<\/a>|<\/ a>)/)
    string = "#{string_before_anchor}[#{anchor_text}](#{href})#{string}"
  end
  # remove orphan </a> tags
  string = strip_redundant_close_anchors string
  return string
end

def has_anchor_tag?(string)
  return string.include?('<a ')
end

# Used to strip random </a>'s sprinkled in some strings.
def strip_redundant_close_anchors(string)
  while anchor_close_start_index = (string =~ /<\/a>/)
    anchor_open_start_index = (string =~ /<a /)
    if !anchor_open_start_index || anchor_open_start_index > anchor_close_start_index
      string_before_anchor = string[0...anchor_close_start_index]
      string = string[anchor_close_start_index..-1]
      anchor_close_end_index = (string =~ />/)
      string = string[anchor_close_end_index+1..-1]
      string = "#{string_before_anchor}#{string}"
    else
      break
    end
  end
  return string
end

LANGUAGE_FILES = Dir.glob('../../config/locales/*.yml')
I18n.load_path += LANGUAGE_FILES
strings = {}
I18n.available_locales.each do |locale|
  [
    "activerecord.attributes.user.finish_sign_up_subheader",
    "activerecord.attributes.user.finish_sign_up_subheader_provider",
    #"activerecord.attributes.user.name", no html
    "activerecord.attributes.user.name_example",
    "activerecord.attributes.user.personal_email",
    #"auth.signed_in", no html
    #"devise.registrations.signed_up", no html
    #"gallery.activity_count", no longer has html_safe
    #"gallery.more", just had a right arror. remove html_safe from this string
    #"peer_review.must_be_enrolled", no html
    #"peer_review.no_reviews_at_this_moment_notice", no html
    #"peer_review.review_submitted", no html
    #"signup_form.email_preference_no", no html
    #"signup_form.email_preference_question", no html
    #"signup_form.email_preference_yes", no html
    #"signup_form.hoc_already_signed_up_content", not used anywhere in code...
    "signup_form.hoc_already_signed_up_content_post_hoc",
    "signup_form.overview",
    "terms_interstitial.accept_label",
    "terms_interstitial.intro_desc",
    "terms_interstitial.reminder_desc",
    "user.create_personal_login_email_note",
    "user.create_personal_login_terms",
    "zendesk_too_young_message"
  ].each do |key|
    result = find(key, locale)
    if result 
      markdown_key = result[:key]
      # this is a special one we are updating because we are stripping just the <br> tags from it
      if markdown_key != "#{locale}.activerecord.attributes.user.name_example"
        markdown_key = markdown_key + '_markdown'
      end
      string = result[:string]
      # strip <br/> tags
      string = string.gsub(/(<br>|<br\/>)/, ' ')
      strings[markdown_key] = result[:string]
    end
  end
end
puts JSON(strings)

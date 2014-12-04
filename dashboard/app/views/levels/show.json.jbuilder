local = Hash.new(false).merge!(local_assigns.delete_if{|_,v|v.nil?})
level, app_options = blockly_options(local_assigns)
embed = local[:embed] || @embed
send_to_phone = request.location.try(:country_code) == 'US' || (!Rails.env.production? && request.location.try(:country_code) == 'RD')
blockly_path = "#{ActionController::Base.asset_host}/blockly/"

json.levelId @level.level_num
json.level_source_id @level_source_id if @level_source_id
json.send_to_phone_url @phone_share_url if @phone_share_url
json.sendToPhone true if send_to_phone
json.disableSocialShare true if (@current_user && @current_user.under_13?) || @embed
json.embed true if embed
json.scriptId @script.id if @script
json.levelGameName @level.game.name if @level.game
json.level level
json.skinId @level.skin if @level.is_a?(Blockly)
json.callouts @callouts.to_json || []
json.createCallouts <<-JavaScript.strip_heredoc.chomp
function() {
  $.fn.qtip.zindex = 500;
  this.callouts.every(function(callout) {
    var selector = callout.element_id; // jquery selector.
    if ($(selector).length <= 0) { console.log("Couldn't find callout target."); return true;}

    var defaultConfig = {
      content: {
        text: callout.localized_text,
        title: {
          button: $('<div class="tooltip-x-close"/>').append($('<img src="#{asset_path 'x_button.png'}"/>'))
        }
      },
      style: {
        classes: "",
        tip: {
          width: 20,
          height: 20
        }
      },
      position: {
        my: "bottom left",
        at: "top right"
      },
      hide: {
        event: 'click mousedown touchstart'
      },
      show: false // don't show on mouseover
    };

    var customConfig = $.parseJSON(callout.qtip_config);
    var config = $.extend(true, {}, defaultConfig, customConfig);
    config.style.classes = config.style.classes.concat(" cdo-qtips");

    var calloutDomElement = $(selector).qtip(config);
    calloutDomElement.qtip('show');

    return true;
  });
}
JavaScript
json.onInitialize "function() {
  this.createCallouts();
  onInitializeListeners.forEach(function(listener) {
    listener();
  });
  #{render(partial: 'levels/chrome34Fix', formats: :js) if browser.chrome? && browser.version.to_s.to_i == 34}
}"
json.locale js_locale
json.containerId 'blocklyApp'
json.baseUrl blockly_path
json.cacheBust blockly_cache_bust

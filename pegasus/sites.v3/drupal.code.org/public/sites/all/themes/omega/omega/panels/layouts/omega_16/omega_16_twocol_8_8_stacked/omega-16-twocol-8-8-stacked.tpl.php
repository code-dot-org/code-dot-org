<div class="panel-display omega-grid omega-16-twocol-8-8-stacked" <?php if (!empty($css_id)) { print "id=\"$css_id\""; } ?>>
  <div class="panel-panel grid-16">
    <div class="inside"><?php print $content['top']; ?></div>
  </div>
  <div class="panel-panel grid-8">
    <div class="inside"><?php print $content['left']; ?></div>
  </div>
  <div class="panel-panel grid-8">
    <div class="inside"><?php print $content['right']; ?></div>
  </div>
  <div class="panel-panel grid-16">
    <div class="inside"><?php print $content['bottom']; ?></div>
  </div>
</div>

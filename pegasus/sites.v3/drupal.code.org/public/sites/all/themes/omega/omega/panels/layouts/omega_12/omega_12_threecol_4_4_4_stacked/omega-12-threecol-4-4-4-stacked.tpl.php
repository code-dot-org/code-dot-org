<div class="panel-display omega-grid omega-12-threecol-4-4-4" <?php if (!empty($css_id)) { print "id=\"$css_id\""; } ?>>
  <div class="panel-panel grid-12">
    <div class="inside"><?php print $content['top']; ?></div>
  </div>
  <div class="panel-panel grid-4">
    <div class="inside"><?php print $content['left']; ?></div>
  </div>
  <div class="panel-panel grid-4">
    <div class="inside"><?php print $content['middle']; ?></div>
  </div>
  <div class="panel-panel grid-4">
    <div class="inside"><?php print $content['right']; ?></div>
  </div>
  <div class="panel-panel grid-12">
    <div class="inside"><?php print $content['bottom']; ?></div>
  </div>
</div>

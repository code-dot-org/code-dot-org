<div class="panel-display omega-grid omega-12-twocol-6-6-bricks" <?php if (!empty($css_id)) { print "id=\"$css_id\""; } ?>>
  <div class="panel-panel grid-12">
    <div class="inside"><?php print $content['top']; ?></div>
  </div>
  <div class="panel-panel grid-6">
    <div class="inside"><?php print $content['left_above']; ?></div>
  </div>
  <div class="panel-panel grid-6">
    <div class="inside"><?php print $content['right_above']; ?></div>
  </div>
  <div class="panel-panel grid-12">
    <div class="inside"><?php print $content['middle']; ?></div>
  </div>
  <div class="panel-panel grid-6">
    <div class="inside"><?php print $content['left_below']; ?></div>
  </div>
  <div class="panel-panel grid-6">
    <div class="inside"><?php print $content['right_below']; ?></div>
  </div>
  <div class="panel-panel grid-12">
    <div class="inside"><?php print $content['bottom']; ?></div>
  </div>
</div>

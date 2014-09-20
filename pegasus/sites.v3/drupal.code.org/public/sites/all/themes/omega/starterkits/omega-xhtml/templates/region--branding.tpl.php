<div<?php print $attributes; ?>>
  <div<?php print $content_attributes; ?>>
    <div class="branding-data clearfix">
      <?php if (isset($linked_logo_img)): ?>
      <div class="logo-img">
        <?php print $linked_logo_img; ?>
      </div>
      <?php endif; ?>
      <?php if ($site_name || $site_slogan): ?>
      <?php $class = $site_name_hidden && $site_slogan_hidden ? ' element-invisible' : ''; ?>
      <div class="site-name-slogan<?php print $class; ?>">
        <?php $class = $site_name_hidden && !$site_slogan_hidden ? ' element-invisible' : ''; ?>
        <?php if ($is_front): ?>
        <h1 class="site-title<?php print $class; ?>"><?php print $linked_site_name; ?></h1>
        <?php else: ?>
        <h2 class="site-title<?php print $class; ?>"><?php print $linked_site_name; ?></h2>
        <?php endif; ?>
        <?php print ($site_slogan_hidden && !$site_name_hidden ? ' element-invisible' : ''); ?>
        <?php if ($site_slogan): ?>
        <h6 class="site-slogan<?php print $class; ?>"><?php print $site_slogan; ?></h6>
        <?php endif; ?>
      </div>
      <?php endif; ?>
    </div>
    <?php print $content; ?>
  </div>
</div>

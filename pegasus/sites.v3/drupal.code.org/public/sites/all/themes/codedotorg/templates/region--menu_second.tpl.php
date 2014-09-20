<div<?php print $attributes; ?>>
  <div<?php print $content_attributes; ?>>
    <?php if ($secondary_menu): ?>
    <nav class="navigation">
      <?php print theme('links__system_secondary_menu', array('links' => $secondary_menu, 'attributes' => array('id' => 'secondary-menu', 'class' => array('links', 'inline', 'clearfix', 'secondary-menu')), 'heading' => array('text' => t('More Links'),'level' => 'h2'))); ?>
    </nav>
    <?php endif; ?>
    <?php print $content; ?>
  </div>
</div>

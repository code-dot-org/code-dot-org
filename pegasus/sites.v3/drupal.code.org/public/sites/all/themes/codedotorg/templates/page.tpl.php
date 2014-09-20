<?php 
/**
 * @file
 * Theme implementation to display a single Drupal page.
 */
?>
<?php if (isset($page['content'])) : ?>
  <?php print render($page['content']); ?>
<?php endif; ?>

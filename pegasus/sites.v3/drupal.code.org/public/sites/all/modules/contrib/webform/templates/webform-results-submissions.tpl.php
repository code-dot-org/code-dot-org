<?php
// $Id:

/**
 * @file
 * Result submissions page.
 *
 * Available variables:
 * - $node: The node object for this webform.
 * - $submission: The Webform submission array.
 * - $total_count: The total number of submissions to this webform.
 * - $pager_count: The number of results to be shown per page.
 * - is_submissions: The user is viewing the node/NID/submissions page.
 * - $table: The table[] array consists of three keys:
 * - $table['#header']: Table header.
 * - $table['#rows']: Table rows.
 * - $table['#operation_total']: Maximum number of operations in the operation column.
 */
?>

<?php if (count($table['#rows'])): ?>
  <?php print theme('webform_results_per_page', array('total_count' => $total_count, 'pager_count' => $pager_count)); ?>
  <?php print render($table); ?>
<?php else: ?>
  <?php print t('There are no submissions for this form. <a href="!url">View this form</a>.', array('!url' => url('node/' . $node->nid))); ?>
<?php endif; ?>


<?php if ($is_submissions): ?>
  <?php print theme('links', array('links' => array('webform' => array('title' => t('Go back to the form'), 'href' => 'node/' . $node->nid)))); ?>
<?php endif; ?>

<?php if ($pager_count): ?>
  <?php print theme('pager', array('limit' => $pager_count)); ?>
<?php endif; ?>

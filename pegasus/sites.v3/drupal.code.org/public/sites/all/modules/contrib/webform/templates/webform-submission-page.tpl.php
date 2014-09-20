<?php

/**
 * @file
 * Customize the navigation shown when editing or viewing submissions.
 *
 * Available variables:
 * - $node: The node object for this webform.
 * - $mode: Either "form" or "display". May be other modes provided by other
 *          modules, such as "print" or "pdf".
 * - $submission: The Webform submission array.
 * - $submission_content: The contents of the webform submission.
 * - $submission_navigation: The previous submission ID.
 * - $submission_information: The next submission ID.
 */
?>

<?php if ($mode == 'display' || $mode == 'form'): ?>
  <div class="clearfix">
    <?php print $submission_actions; ?>
    <?php print $submission_navigation; ?>
  </div>
<?php endif; ?>

<?php print $submission_information; ?>

<div class="webform-submission">
  <?php print render($submission_content); ?>
</div>

<?php if ($mode == 'display' || $mode == 'form'): ?>
  <div class="clearfix">
    <?php print $submission_navigation; ?>
  </div>
<?php endif; ?>

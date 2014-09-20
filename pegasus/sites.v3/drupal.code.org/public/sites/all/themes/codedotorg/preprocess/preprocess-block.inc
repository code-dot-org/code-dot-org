<?php

function codedotorg_alpha_preprocess_block(&$vars) {
  if ($vars['block_html_id'] == 'block-webform-client-block-27' || $vars['block_html_id'] == 'block-multiblock-1') {
    $vars['content'] .= '<div class="form-error"></div>';
  }
}

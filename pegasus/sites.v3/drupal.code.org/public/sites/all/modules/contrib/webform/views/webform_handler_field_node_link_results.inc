<?php

/**
 * @file
 * Views handler to display a results link for Webform submissions.
 */

/**
 * Field handler to present a link node edit.
 */
class webform_handler_field_node_link_results extends views_handler_field_node_link {

  /**
   * Renders the link.
   */
  function render_link($node, $values) {
    // Ensure user has access to edit this node.
    if (!webform_results_access($node)) {
      return;
    }

    $this->options['alter']['make_link'] = TRUE;
    $this->options['alter']['path'] = "node/$node->nid/webform-results";

    $text = !empty($this->options['text']) ? $this->options['text'] : t('results');
    return $text;
  }

}


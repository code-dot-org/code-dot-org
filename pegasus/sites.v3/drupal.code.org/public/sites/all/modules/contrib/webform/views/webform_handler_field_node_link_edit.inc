<?php

/**
 * @file
 * Views handler to display an edit link for Webform configuration.
 */

/**
 * Field handler to present a link node edit.
 */
class webform_handler_field_node_link_edit extends views_handler_field_node_link {

  /**
   * Renders the link.
   */
  function render_link($node, $values) {
    // Ensure user has access to edit this node.
    if (!node_access('update', $node)) {
      return;
    }

    $this->options['alter']['make_link'] = TRUE;
    $this->options['alter']['path'] = "node/$node->nid/webform";

    $text = !empty($this->options['text']) ? $this->options['text'] : t('edit webform');
    return $text;
  }

}


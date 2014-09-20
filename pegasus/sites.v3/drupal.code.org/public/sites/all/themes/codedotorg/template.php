<?php

function codedotorg_custom_preprocess_webform_form(&$vars) {
//   $vars['form']['submitted']['name']['#prefix'] = '<div class="control-group">';
//   $vars['form']['submitted']['name']['#suffix'] = '</div>';

//   dpm($vars['form']['submitted']);
}

/*
 * Implementation of theme_preprocess_hook for forms.
 */
// function codedotorg_preprocess_form($variables) {
//   // For webforms.
//   if (strpos($variables['element']['#form_id'], 'webform') === 0) {
// 
//     // Add classes to the submit button for styling with Bootstrap.
//     if (isset($variables['element']['actions']['submit'])) {
//       $variables['element']['actions']['submit']['#attributes']['class'][] = 'btn';
//       $variables['element']['actions']['submit']['#attributes']['class'][] = 'btn-cdo-basic';
//     }
//     dpm($variables);
// 
//   }
// }

/**
 * Theme override for theme_webform_element().
 */
function codedotorg_webform_element($variables) {

  // Ensure defaults.
  $variables['element'] += array(
    '#title_display' => 'before',
  );

  $element = $variables['element'];

  // All elements using this for display only are given the "display" type.
  if (isset($element['#format']) && $element['#format'] == 'html') {
    $type = 'display';
  }
  else {
    $type = (isset($element['#type']) && !in_array($element['#type'], array('markup', 'textfield', 'webform_email', 'webform_number'))) ? $element['#type'] : $element['#webform_component']['type'];
  }

  // Convert the parents array into a string, excluding the "submitted" wrapper.
  $nested_level = $element['#parents'][0] == 'submitted' ? 1 : 0;
  $parents = str_replace('_', '-', implode('--', array_slice($element['#parents'], $nested_level)));

  $wrapper_classes = array(
   'form-item',
   'webform-component',
   'webform-component-' . $type,
  );

  /* CUSTOMIZATION FOR CODE.ORG */
  if (in_array($element['#webform_component']['nid'], array(91, 92, 124)) || current_path() == 'node/27') {
    $wrapper_classes[] = 'control-group';
    $element['#children'] = '<div class="controls">' . $element['#children'] . '</div>';
  }
  /* END CUSTOMIZATION FOR CODE.ORG */

  if (isset($element['#title_display']) && strcmp($element['#title_display'], 'inline') === 0) {
    $wrapper_classes[] = 'webform-container-inline';
  }
  $output = '<div class="' . implode(' ', $wrapper_classes) . '" id="webform-component-' . $parents . '">' . "\n";

  // If #title is not set, we don't display any label or required marker.
  if (!isset($element['#title'])) {
    $element['#title_display'] = 'none';
  }
  $prefix = isset($element['#field_prefix']) ? '<span class="field-prefix">' . _webform_filter_xss($element['#field_prefix']) . '</span> ' : '';
  $suffix = isset($element['#field_suffix']) ? ' <span class="field-suffix">' . _webform_filter_xss($element['#field_suffix']) . '</span>' : '';

  switch ($element['#title_display']) {
    case 'inline':
    case 'before':
    case 'invisible':
      $output .= ' ' . theme('form_element_label', $variables);
      $output .= ' ' . $prefix . $element['#children'] . $suffix . "\n";
      break;

    case 'after':
      $output .= ' ' . $prefix . $element['#children'] . $suffix;
      $output .= ' ' . theme('form_element_label', $variables) . "\n";
      break;

    case 'none':
    case 'attribute':
      // Output no label and no required marker, only the children.
      $output .= ' ' . $prefix . $element['#children'] . $suffix . "\n";
      break;
  }

  if (!empty($element['#description'])) {
    $output .= ' <div class="description">' . $element['#description'] . "</div>\n";
  }

  $output .= "</div>\n";

  return $output;
}

/**
 * Theme override for theme_form_element_label().
 */
function codedotorg_form_element_label($variables) {
  $element = $variables['element'];
  // This is also used in the installer, pre-database setup.
  $t = get_t();

  // If title and required marker are both empty, output no label.
  if ((!isset($element['#title']) || $element['#title'] === '') && empty($element['#required'])) {
    return '';
  }

  // If the element is required, a required marker is appended to the label.
  $required = !empty($element['#required']) ? theme('form_required_marker', array('element' => $element)) : '';

  $title = filter_xss_admin($element['#title']);

  $attributes = array();
  // Style the label as class option to display inline with the element.
  if ($element['#title_display'] == 'after') {
    $attributes['class'] = 'option';
  }
  // Show label only to screen readers to avoid disruption in visual flows.
  elseif ($element['#title_display'] == 'invisible') {
    $attributes['class'] = 'element-invisible';
  }

  if (!empty($element['#id'])) {
    $attributes['for'] = $element['#id'];
  }

  /* CUSTOMIZATION FOR CODE.ORG */
  if ((isset($element['#webform_component']['nid']) && in_array($element['#webform_component']['nid'], array(91, 92, 124))) || current_path() == 'node/27') {
    if (isset($attributes['class'])) {
      $attributes['class'] = array($attributes['class']);
    }
    $attributes['class'][] = 'control-label';
  }

  // The leading whitespace helps visually separate fields from inline labels.
  return ' <label' . drupal_attributes($attributes) . '>' . $t('!title !required', array('!title' => $title, '!required' => $required)) . "</label>\n";
  /* END CUSTOMIZATION FOR CODE.ORG */
}

/**
 * Theme override for theme_form_required_marker().
 */
function codedotorg_form_required_marker($variables) {
  // This is also used in the installer, pre-database setup.
  $t = get_t();
  $attributes = array(
    'class' => 'form-required',
    'title' => $t('This field is required.'),
  );
  /* CUSTOMIZATION FOR CODE.ORG */
  return '<span' . drupal_attributes($attributes) . '>(Required)</span>';
  /* END CUSTOMIZATION FOR CODE.ORG */
}

/**
 * Theme override for theme_youtube_video().
 */
function codedotorg_youtube_video($variables) {
  $id = $variables['video_id'];
  $size = $variables['size'];
  $width = array_key_exists('width', $variables)? $variables['width'] : NULL;
  $height = array_key_exists('height', $variables)? $variables['height'] : NULL;
  $autoplay = array_key_exists('autoplay', $variables)? $variables['autoplay'] : FALSE;

  // Get YouTube settings.
  $suggest = variable_get('youtube_suggest', TRUE);
  $privacy = variable_get('youtube_privacy', FALSE);
  $wmode = variable_get('youtube_wmode', TRUE);
  $dimensions = youtube_get_dimensions($size, $width, $height);

  // Protocol changes based on current page TODO.
  $protocol = (isset($_SERVER['HTTPS'])) ? 'https' : 'http';

  // Query string changes based on setings.
  $query = array();
  if (!$suggest) {
    $query['rel'] = '0';
  }
  if ($wmode) {
    $query['wmode'] = 'opaque';
  }
  if ($autoplay) {
    $query['autoplay'] = '1';
  }

  /* CUSTOMIZATION FOR CODE.ORG */
  $query['showinfo'] = '0';
  $query['rel'] = '0';
  $query['iv_load_policy'] = '3';
  /* END CUSTOMIZATION FOR CODE.ORG */

  // Domain changes based on settings.
  $domain = ($privacy) ? 'youtube-nocookie.com' : 'youtube.com';

  $path = $protocol . '://www.' . $domain . '/embed/' . $id;
  $src = url($path, array('query' => $query));

  $output = '<iframe width="' . $dimensions['width'] . '" 
    height="' . $dimensions['height'] . '" src="' . $src . '" 
    frameborder="0" allowfullscreen></iframe>';

  return $output;
}

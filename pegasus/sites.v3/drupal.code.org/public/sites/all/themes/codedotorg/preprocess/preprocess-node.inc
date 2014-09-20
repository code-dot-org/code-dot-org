<?php

function codedotorg_alpha_preprocess_node(&$vars) {
  $node = $vars['node'];

  // For webforms.
  if ($vars['type'] == 'webform') {
    $webform = &$vars['content']['webform'];

    // Add classes to submit buttons so they can be styled with Bootstrap.
    if (isset($webform['#form']['actions']['submit'])) {
      $webform['#form']['actions']['submit']['#attributes']['class'][] = 'btn';
      $webform['#form']['actions']['submit']['#attributes']['class'][] = 'btn-cdo-basic';
    }

    // Add classes to theme selected forms.
    if (in_array($vars['nid'], array(91, 92, 124))) {
      $webform['#form']['#attributes']['class'][] = 'form-horizontal';
    }
  }

  // Alter the petition webform.
  if ($vars['nid'] == 27) {
    // Add text after the email field.
    $webform['#form']['submitted']['email']['#field_suffix'] = t('We’ll never spam you.');

    // Add text after the ZIP code field.
    $webform['#form']['submitted']['zip_code']['#field_suffix'] = t('Enter country if outside U.S.');

    // For only the teaser.
    if ($vars['view_mode'] == 'teaser') {
      // Remove the "read more" link and node title.
      if (isset($vars['content']['links'])) {
        $vars['content']['links']['#access'] = FALSE;
      }
      $vars['title'] = '';

      // Add text before the category field.
      $webform['#form']['submitted']['category']['#field_prefix'] = t('I am a ');

      $webform = &$vars['content']['webform'];

      foreach (element_children($vars['content']['webform']['#form']['submitted']) as $field) {
        // Make the field label invisible.
        $webform['#form']['submitted'][$field]['#title_display'] = 'invisible';

        // Remove the size.
        $webform['#form']['submitted'][$field]['#size'] = NULL;

        // Add placeholder attribute to text fields and email field.
        if (isset($webform['#form']['submitted'][$field]['#type']) && in_array($webform['#form']['submitted'][$field]['#type'], array('textfield', 'webform_email'))) {
          // Make all labels lowercase, except ZIP code.
          if ($field == 'zip_code') {
            $label = t('Enter ZIP code or country');
          } else {
            $label = t('Enter your @label', array('@label' => strtolower($webform['#form']['submitted'][$field]['#title'])));
          }
          $webform['#form']['submitted'][$field]['#attributes']['placeholder'] = $label;
        }
      }
    }
    else {
      $webform['#form']['#attributes']['class'][] = 'form-horizontal';
      $webform['#form']['submitted']['category']['#title'] = t('I am a');
    }
  }

  // Alter the webform on the Teach page.
  if ($vars['nid'] == 91) {
    $field_labels = codedotorg_teach_form_labels();
    $webform = &$vars['content']['webform'];

    // Modify the field labels.
    foreach (element_children($vars['content']['webform']['#form']['submitted']) as $field) {
      $field_label = &$webform['#form']['submitted'][$field]['#title'];
      if (array_key_exists($field_label, $field_labels)) {
        $field_label = $field_labels[$field_label];
      }
      // Customize one of the options for the Interest field.
      if ($field == 'interest') {
        $webform['#form']['submitted']['interest']['Math/science curriculum']['#title'] = preg_replace('#\b(existing|using)\b#is', '<em>\1</em>', $webform['#form']['submitted']['interest']['#options']['Math/science curriculum']);
      }
    }

    // Add text after the email field.
    $webform['#form']['submitted']['email']['#field_suffix'] = t('We’ll never spam you.');

    // Add text after the ZIP code field.
    // $webform['#form']['submitted']['zip_code']['#field_suffix'] = t('Enter country if outside U.S.');
  }

  // Alter the webform on the Help Us page.
  if ($vars['nid'] == 92) {
    $field_labels = codedotorg_help_form_labels();
    $webform = &$vars['content']['webform'];

    // Modify the field labels.
    foreach (element_children($vars['content']['webform']['#form']['submitted']) as $field) {
      $field_label = &$webform['#form']['submitted'][$field]['#title'];
      if (array_key_exists($field_label, $field_labels)) {
        $field_label = $field_labels[$field_label];
      }
    }

    // Add text after the email field.
    $webform['#form']['submitted']['email']['#field_suffix'] = t('We’ll never spam you.');

    // Add text after the ZIP code field.
    // $webform['#form']['submitted']['zip_code']['#field_suffix'] = t('Enter country if outside U.S.');
  }

  // Add quote marks to quotes when displayed in teaser mode.
  if ($vars['type'] == 'quote' && $vars['view_mode'] == 'teaser'
    && isset($vars['content']['group_quote_and_source']['field_quote'][0])) {
      $quote = $vars['content']['group_quote_and_source']['field_quote'][0]['#markup'];
      $quote_prefix = '<span class="open-quotes">“</span>';
      $quote_suffix = '<span class="close-quotes">“</span>';
      $vars['content']['group_quote_and_source']['field_quote'][0]['#markup'] = $quote_prefix . $quote . $quote_suffix;
  }

  // Remove the class based on the node author.
  foreach ($vars['attributes_array']['class'] as $key => $class) {
    if (strpos($class, 'author-') === 0) {
      unset($vars['attributes_array']['class'][$key]);
    }
  }
}

function codedotorg_teach_form_labels() {
  $labels = array(
    'Name' => t('Your name'),
    'Email address' => t('Email address'),
    'School name' => t('Name of your school'),
    // 'ZIP code or country' => t('ZIP code'),
    'Role' => t('Your role'),
    'School or district size' => t('How large is your school or district?'),
    'Grade levels' => t('What grade levels?'),
    'Lab or carts' => t('Does your school have a computer lab or laptop carts?'),
    'Internet access' => t('Does your school have internet access?'),
    'Interest' => t('Which are you interested in (check all that apply)?'),
  );
  return $labels;
}

function codedotorg_help_form_labels() {
  $labels = array(
    'Name' => t('Your name'),
    'Email address' => t('Email address'),
    // 'ZIP code or country' => t('ZIP code'),
    'Help time' => t('I could help'),
    'Help location' => t('I can help'),
    'Languages' => t('Languages I know'),
  );
  return $labels;
}

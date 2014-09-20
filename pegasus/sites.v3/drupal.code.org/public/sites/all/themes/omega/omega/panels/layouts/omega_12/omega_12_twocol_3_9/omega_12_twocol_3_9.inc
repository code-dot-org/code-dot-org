<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_12_twocol_3_9_panels_layouts() {
  $items['omega_12_twocol_3_9'] = array(
    'title' => t('Two Column 3-9'),
    'category' => t('Omega: 12 Column Grid'),
    'icon' => 'omega_12_twocol_3_9.png',
    'theme' => 'omega_12_twocol_3_9',
    'admin css' => '../omega_panels_admin_12.css',
    'regions' => array(
      'left' => t('Left side'),
      'right' => t('Right side')
    ),
  );

  return $items;
}

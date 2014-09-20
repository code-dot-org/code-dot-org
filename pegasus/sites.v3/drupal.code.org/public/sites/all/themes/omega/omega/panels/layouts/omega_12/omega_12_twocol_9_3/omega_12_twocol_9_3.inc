<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_12_twocol_9_3_panels_layouts() {
  $items['omega_12_twocol_9_3'] = array(
    'title' => t('Two Column 9-3'),
    'category' => t('Omega: 12 Column Grid'),
    'icon' => 'omega_12_twocol_9_3.png',
    'theme' => 'omega_12_twocol_9_3',
    'admin css' => '../omega_panels_admin_12.css',
    'regions' => array(
      'left' => t('Left side'),
      'right' => t('Right side')
    ),
  );

  return $items;
}

<?php

/**
 * Implements hook_panels_layouts().
 */
function omega_omega_24_twocol_12_12_panels_layouts() {
  $items['omega_24_twocol_12_12'] = array(
    'title' => t('Two Column 12-12'),
    'category' => t('Omega: 24 Column Grid'),
    'icon' => 'omega_24_twocol_12_12.png',
    'theme' => 'omega_24_twocol_12_12',
    'admin css' => 'omega_24_twocol_12_12.css',
    'regions' => array(
      'left' => t('Left side'),
      'right' => t('Right side')
    ),
  );

  return $items;
}

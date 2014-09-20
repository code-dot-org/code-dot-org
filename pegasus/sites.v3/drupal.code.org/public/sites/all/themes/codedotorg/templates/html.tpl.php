<html>
<head>
  <?php print $head; ?>
  <title><?php print $head_title; ?></title>  
  <?php print $styles; ?>
  <?php if (isset($mixpanel_js)) { print $mixpanel_js; } ?>
  <?php if (isset($twitter_metatags)) { print $twitter_metatags; } ?>
  <?php if (isset($extra_metatags)) { print $extra_metatags; } ?>
  <?php print $scripts; ?>
  <!--[if lt IE 9]><script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script><![endif]-->
</head>
<body<?php print $attributes;?>>
  <?php print $page_top; ?>
  <?php print $page; ?>
  <?php print $page_bottom; ?>
</body>
</html>

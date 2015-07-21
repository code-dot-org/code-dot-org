---
from: 'Melissa Jones <mj@code.org>'
subject: "Welcome to the Code.org Teacher Community!"
---
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
<head>
 
<meta name="viewport" content="width=device-width"/>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<title>Code.org Teacher Community Newsletter</title>
<style>
/* ------------------------------------- 
		GLOBAL 
------------------------------------- */
* { 
	margin:0;
	padding:0;
}
* { font-family: "Helvetica Neue", "Helvetica", Helvetica, Arial, sans-serif; }

img { 
	max-width: 100%; 
}
.collapse {
	margin:0;
	padding:0;
}
body {
	-webkit-font-smoothing:antialiased; 
	-webkit-text-size-adjust:none; 
	width: 100%!important; 
	height: 100%;
}


/* ------------------------------------- 
		ELEMENTS 
------------------------------------- */
a { color: #0094ca;}

.btn {
	text-decoration:none;
	color: #FFF;
	background-color: #7665a0;
	padding:10px 16px;
	font-weight:bold;
	margin-right:10px;
	text-align:center;
	cursor:pointer;
	display: inline-block;
}

p.callout {
	padding:15px;
	background-color:#ffa400;
	margin-bottom: 15px;
}
.callout a {
	font-weight:bold;
	color: #fff;
}

table.social {
/* 	padding:15px; */
	background-color: #e7e8ea;
	
}
.social .soc-btn {
	padding: 3px 7px;
	font-size:12px;
	margin-bottom:10px;
	text-decoration:none;
	color: #FFF;font-weight:bold;
	display:block;
	text-align:center;
}
a.tb { background-color: #35465c!important; }
a.tw { background-color: #1daced!important; }
a.fm { background-color: #7665a0!important; }
a.ms { background-color: #000!important; }

.sidebar .soc-btn { 
	display:block;
	width:100%;
}

/* ------------------------------------- 
		HEADER 
------------------------------------- */
table.head-wrap { width: 100%;}

.header.container table td.logo { padding: 15px; }
.header.container table td.label { padding: 15px; padding-left:0px;}


/* ------------------------------------- 
		BODY 
------------------------------------- */
table.body-wrap { width: 100%;}


/* ------------------------------------- 
		FOOTER 
------------------------------------- */
table.footer-wrap { width: 100%;	clear:both!important;
}
.footer-wrap .container td.content  p { border-top: 1px solid rgb(215,215,215); padding-top:15px;}
.footer-wrap .container td.content p {
	font-size:10px;
	font-weight: bold;
	
}


/* ------------------------------------- 
		TYPOGRAPHY 
------------------------------------- */
h1,h2,h3,h4,h5,h6 {
font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif; line-height: 1.1; margin-bottom:15px; color:#000;
}
h1 small, h2 small, h3 small, h4 small, h5 small, h6 small { font-size: 60%; color: #6f6f6f; line-height: 0; text-transform: none; }

h1 { font-weight:200; font-size: 44px;}
h2 { font-weight:200; font-size: 37px;}
h3 { font-weight:500; font-size: 27px;}
h4 { font-weight:500; font-size: 23px;}
h5 { font-weight:900; font-size: 17px;}
h6 { font-weight:900; font-size: 14px; text-transform: uppercase; color:#444;}

.collapse { margin:0!important;}

p, ul { 
	margin-bottom: 10px; 
	font-weight: normal; 
	font-size:14px; 
	line-height:1.6;
}
p.lead { font-size:17px; }
p.last { margin-bottom:0px;}

ul li {
	margin-left:5px;
	list-style-position: inside;
}

/* ------------------------------------- 
		SIDEBAR 
------------------------------------- */
ul.sidebar {
	background:#ebebeb;
	display:block;
	list-style-type: none;
}
ul.sidebar li { display: block; margin:0;}
ul.sidebar li a {
	text-decoration:none;
	color: #666;
	padding:10px 16px;
/* 	font-weight:bold; */
	margin-right:10px;
/* 	text-align:center; */
	cursor:pointer;
	border-bottom: 1px solid #777777;
	border-top: 1px solid #FFFFFF;
	display:block;
	margin:0;
}
ul.sidebar li a.last { border-bottom-width:0px;}
ul.sidebar li a h1,ul.sidebar li a h2,ul.sidebar li a h3,ul.sidebar li a h4,ul.sidebar li a h5,ul.sidebar li a h6,ul.sidebar li a p { margin-bottom:0!important;}



/* --------------------------------------------------- 
		RESPONSIVENESS
		Nuke it from orbit. It's the only way to be sure. 
------------------------------------------------------ */

/* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
.container {
	display:block!important;
	max-width:600px!important;
	margin:0 auto!important; /* makes it centered */
	clear:both!important;
}

/* This should also be a block element, so that it will fill 100% of the .container */
.content {
	padding:15px;
	max-width:600px;
	margin:0 auto;
	display:block; 
}

/* Let's make sure tables in the content area are 100% wide */
.content table { width: 100%; }


/* Odds and ends */
.column {
	width: 300px;
	float:left;
}
.column tr td { padding: 15px; }
.column-wrap { 
	padding:0!important; 
	margin:0 auto; 
	max-width:600px!important;
}
.column table { width:100%;}
.social .column {
	width: 280px;
	min-width: 279px;
	float:left;
}

/* Be sure to place a .clear element after each set of columns, just to be safe */
.clear { display: block; clear: both; }


/* ------------------------------------------- 
		PHONE
		For clients that support media queries.
		Nothing fancy. 
-------------------------------------------- */
@media only screen and (max-width: 600px) {
	
	a[class="btn"] { display:block!important; margin-bottom:10px!important; background-image:none!important; margin-right:0!important;}

	div[class="column"] { width: auto!important; float:none!important;}
	
	table.social div[class="column"] {
		width:auto!important;
	}

}
</style>
</head>
<body bgcolor="#FFFFFF" topmargin="0" leftmargin="0" marginheight="0" marginwidth="0">
 
<table class="head-wrap" bgcolor="#00adbc">
<tr>
<td></td>
<td class="header container" align="">
 
<div class="content">
<table bgcolor="#00adbc">
<tr>
<td><img src="https://code.org/images/logo.png"/></td>
<td align="right"><h6 class="collapse">Teacher Community Newsletter</h6></td>
</tr>
</table>
</div> 
</td>
<td></td>
</tr>
</table> 
 
<table class="body-wrap" bgcolor="">
<tr>
<td></td>
<td class="container" align="" bgcolor="#FFFFFF">
 
<div class="content">
<table>
<tr>
<td>
<h1>Welcome to the Code.org Teacher Community!</h1>
<p class="lead">This past school year, Code.org prepared over 10,000​ teachers across K­12, with over 6 million students engaged in our courses. 
</p>
 
<p><img src="images/teachcode/july-header.jpg"/></p> 
<p>Together with you, our teacher community, we’re changing the face of Computer Science education. We couldn’t be more proud of the work you do.</p>
</td>
</tr>
</table>
</div> 
 
<div class="content">
<table bgcolor="">
<tr>
<td class="small" width="20%" style="vertical-align: top; padding-right:10px;"><img src="images/teachcode/july-a.jpg" width="75px"/></td>
<td>
<h4>Announcing: The new Code.org Professional Learning Community <small></small></h4>
<p class="">Thousands of teachers just like you have joined the Code.org teacher community from across the globe. Now, you can <a href="http://forum.code.org">connect with others in our forums</a> to share best practices, get support and find inspiration. </p>
<a class="btn" href="http://forum.code.org/c/plc">Join the conversation &raquo;</a>
</td>
</tr>
</table>
</div> 
 
<div class="content"><table bgcolor="">
<tr>
<td class="small" width="20%" style="vertical-align: top; padding-right:10px;"><img src="images/teachcode/july-b.jpg"/></td>
<td>
<h4>Free Online Professional Development </h4>
<p class="">Learn how to teach computer science using Code.org’s Courses 1-4 with a free, self-paced online course. This is a new offering, designed to compliment our <a href="http://code.org/educate/k5">in-person K-5 teacher workshops</a> </p>
<a class="btn" href="https://studio.code.org/s/K5-OnlinePD">Get started &raquo;</a>
</td>
</tr>
</table></div> 
 
<div class="content"><table bgcolor="">
<tr>
<td class="small" width="20%" style="vertical-align: top; padding-right:10px;"><img src="images/teachcode/july-c.jpg"/></td>
<td>
<h4>Computer Science Counts in 26 State Plus DC</h4>
<p class="">Minnesota now allows computer science to fulfill a high school mathematics graduation requirement, which means the majority of states allow computer science to count!</p>
<a class="btn" href="http://code.org/promote">View Map &raquo;</a>
</td>
</tr>
</table></div> 

<div class="content"><table bgcolor="">
<tr>
<td>
 
<p class="callout">You can learn more about Code.org’s 2014-15 school year results by reviewing our year-end status update. <a href="http://blog.code.org/post/124017777158/mid-2015-update">Learn more &raquo;</a> </p> 
</td>
</tr>
</table></div> 
 
<div class="content">
<table bgcolor="">
<tr>
<td>
 
<table bgcolor="" class="social" width="100%">
<tr>
<td>
 
<div class="column">
<table bgcolor="" cellpadding="" align="left">
<tr>
<td>
<h5 class="">Connect with the Code.org Teacher Community:</h5>
<p class=""><a href="http://forum.code.org/c/plc" class="soc-btn fm">Forums</a> <a href="http://twitter.com/teachcodeorg" class="soc-btn tw">Twitter</a> <a class="soc-btn tb" href="http://teachcodeorg.tumblr.com">Tumblr</a></p>
</td>
</tr>
</table> 
</div>
 
<div class="column">
<table bgcolor="" cellpadding="" align="left">
<tr>
<td>
<h5 class="">For more information:</h5>
<p>
Visit: <strong><a href="http://code.org/educate">code.org/educate</strong></p>
</td>
</tr>
</table> 
</div>
<div class="clear"></div>
</td>
</tr>
</table> 
</td>
</tr>
</table>
</div> 
</td>
<td></td>
</tr>
</table> 
 
<table class="footer-wrap">
<tr>
<td></td>
<td class="container">
 
<div class="content">
<table>
<tr>
<td align="center">
<p>
Code.org is a 501c3 non-profit located at 1301 5th Avenue, Suite 1225, Seattle, WA, 98101. You’re receiving this email because you signed up as a teacher on <a href="https://studio.code.org/">Code Studio</a> or hosted an <a href="https://hourofcode.com/">Hour of Code</a>. We’ll send you monthly newsletters like these and occasional updates on ways to get involved and the outcomes of your support. Don’t like these emails? <a href="<%= unsubscribe_link %>">Unsubscribe</a>.
</small>
</p>
</td>
</tr>
</table>
</div> 
</td>
<td></td>
</tr>
</table> 
</body>
</html>
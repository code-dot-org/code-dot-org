<html>
<head>
	<title>Page for Checking HTTP get and post vars</title>
	<link rel="stylesheet" href="css/bootstrap.min.css">
</head>
<body>
	<h1>HTTP get/post variable check</h1>
	<p>You can send form data to this page via HTTP GET or POST and the page will show you what you sent</p>
	<div class="container">
		<h4>Query string variables (HTTP GET vars)</h4>
			<?php if($_GET){ ?>
				<table class="table-striped" width="300">
					<tr><th>variable</th><th>value</th></tr>
						
					<?php foreach(array_keys($_GET) as $k){ ?>
						<tr>
							<td><?php echo $k; ?></td>
							<td><?php echo $_GET[$k]; ?></td>
						</tr>
							
					<?php } ?>
				</table>
			<?php } ?>
				
						
					
	</div>
	<div>
		<h4>POST variables</h4>
			<?php if($_POST){ ?>
				<table class="table-striped" width="300">
					<tr><th>variable</th><th>value</th></tr>
						
					<?php foreach(array_keys($_POST) as $k){ ?>
						<tr>
							<td><?php echo $k; ?></td>
							<td><?php echo $_POST[$k]; ?></td>
						</tr>
							
					<?php } ?>
				</table>
			<?php } ?>
	</div>

</body>
</html>



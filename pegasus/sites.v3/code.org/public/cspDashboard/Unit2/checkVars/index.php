<html>
<head>
	<title>Page for Checking HTTP get and post vars</title>
	<link rel="stylesheet" href="../css/bootstrap.min.css">
</head>
<body>
	<h1>HTTP GET variable check</h1>
	<p>You can send form data to this page via HTTP GET (or POST) and the page will show you what you sent</p>
	<?php if($_GET){ ?>
	<div class="container">
		<h4>Found vars in the Query String...</h4>
			
				<table class="table-striped" width="300">
					<tr><th>variable</th><th>value</th></tr>
						
					<?php foreach(array_keys($_GET) as $k){ ?>
						<tr>
							<td><?php echo $k; ?></td>
							<td><?php echo $_GET[$k]; ?></td>
						</tr>
							
					<?php } ?>
				</table>
				
	</div>
	<?php } ?>	
	<?php if($_POST){ ?>
	<div class="container">
		<h4>There are POST variables</h4>
		<p> Check out network traffic...</p>
				
				
			
	</div>
	<?php } ?>

</body>
</html>



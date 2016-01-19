//@author devenbhooshan
//Modified GREATLY by Baker Franke

function randBetween(lo, hi){
	if(lo>=hi) return 0;
	
	return Math.floor( (pRand()*(hi-lo)) + lo);
	
}



function pRand() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}



var locList = [
{x:-0.6129070536529765, y:-0.7901550123756904}, 
{x:-0.24868988716485482, y:0.9685831611286311}, 
{x:0.9177546256839811, y:-0.39714789063478056}, 
{x:-0.8763066800438636, y:-0.4817536741017153}, 
{x:0.15643446504023079, y:0.9876883405951378}, 
{x:0.6845471059286887, y:-0.7289686274214114}, 
{x:-0.9955619646030797, y:-0.09410831331851799}, 
{x:0.5358267949789964, y:0.8443279255020152}, 
{x:0.33873792024529153, y:-0.9408807689542255}, 
{x:-0.9510565162951536, y:0.30901699437494723}, 
{x:0.8270805742745617, y:0.5620833778521308}, 
{x:-0.06279051952931314, y:-0.9980267284282716}, 
{x:-0.750111069630455, y:0.661311865323657}, 
{x:0.9822872507286873, y:0.18738131458573187}, 
{x:-0.4539904997395465, y:-0.891006524188368}, 
{x:-0.42577929156507294, y:0.9048270524660194}, 
{x:0.9759167619387459, y:-0.21814324139654917}, 
{x:-0.770513242775789, y:-0.63742398974869}, 
{x:-0.03141075907813577, y:0.9995065603657313}, 
{x:0.8090169943749477, y:-0.5877852522924728}, 
{x:-0.960293685676945, y:-0.27899110603922284}, 
{x:0.36812455268467753, y:0.9297764858882516}, 
{x:0.5090414157503778, y:-0.8607420270039398}, 
{x:-0.9921147013144779, y:0.1253332335643038}, 
{x:0.7071067811865522, y:0.7071067811865429}];


var seed=-1;

function setSeed(s){
	seed = s;
	//return new Graph();
}


function Graph(){
	this.isWeighted=false;
	this.nodes=[]
	this.addNode=addNode;
	this.removeNode=removeNode;
	this.getNodeByName=getNodeByName;
	this.getAllNodes=getAllNodes;
	this.totalWeight = 0;
	this.isUndirected = true;
	this.edgeSelectionOn = true;
	this.autoEdgeSelection = false; //turn edges on for selected nodes -- need for Ice Cream Truck
	this.showWeights = true;
	this.edgeColor = "#000000";
	this.edgeHoverColor = "#006600";
	this.edgeSelectedColor = "#00FF00";
	this.showWeightOnlyWhenSelected = false;
	this.statusText = "";
	this.canDragNodes = true;
	this.showNodeShadows = false;
	this.originalLocations = {};
	this.graphNum = "";
	this.randomLocations = true;
	if(seed==-1) seed = parseInt(Math.random()*9999);
	
	this.getAdjListStr = function(){
		
		var edgesDone = new Object();
		var dataStr = "";
		for(var i=0; i<this.nodes.length; i++){
			var thisNode = this.nodes[i].name;
			for(var j=0; j<this.nodes[i].adjList.length; j++){
				var nbr = this.nodes[i].adjList[j].name;
				if(edgesDone[thisNode+nbr]!==1){
					edgesDone[thisNode+nbr]=1;
					edgesDone[nbr+thisNode]=1;
					dataStr += this.nodes[i].name+", "+this.nodes[i].adjList[j].name+", "+this.nodes[i].weight[j]+"\n";
					
				}
			}
		}
		console.debug(dataStr);
		return dataStr;
		
	}
	
	//this.locList = [ {x:100, y:200}, {x:150, y:200}];
	//Get the geometric distance between two nodes, to differentiate from 'distance' given by weigh
	this.geoDist = function(node1, node2){
		if(node1===null || node2===null) return Number.MAX_VALUE;
		
		return Math.sqrt( Math.pow(node1.x-node2.x,2) + Math.pow(node1.y-node2.y,2));

		
		
	}

	this.generateGraph = function(numNodes, maxDegree, minWeight, maxWeight, isUndirected, hasTour){
		
		this.isUndirected = isUndirected; //will ensure nodes get added properly

		//add all the nodes		
		this.addNode("A");
		this.nodes[0].setLocation(500,200);
		for(var i=1; i<numNodes; i++){
			this.addNode(String.fromCharCode(65+i));
			
		
			
			if(hasTour==true){ //if there is a tour build it as you add nodes
				this.addEdge(this.nodes[i-1], this.nodes[i], randBetween(minWeight, maxWeight));
			}
		}
		if(hasTour==true) this.addEdge(this.nodes[numNodes-1], this.nodes[0],  randBetween(minWeight, maxWeight)); 
		
		if(hasTour==true) maxDegree -=2; //if there is a tour every node has degree 2 by default
		
		for(var i=0; i<numNodes; i++){
			var numEdges = randBetween(0,maxDegree+1);
			
			for(var e=0; e<numEdges; e++){
				
				var edgeTo = this.nodes[i]; 
				
				while(edgeTo == this.nodes[i] || this.nodes[i].containsEdge(edgeTo)){ //make sure not a duplicate or self edge
					edgeTo = this.nodes[randBetween(0,numNodes)];
				}
			
				this.addEdge(this.nodes[i], edgeTo, randBetween(minWeight, maxWeight));
			}
			
		}
		this.setAllLocations();
		
		
		
		
	}
	

	this.setAllLocations = function(){
		
		//Pulls from locations in locList: 26 generated points around a unit circle
		if(this.randomLocations === false){
			for(var i=0; i<this.nodes.length; i++){
			var yLoc = 200 + locList[i%25].x*150; //(pRand()*50)+175 + Math.sin((i*1.29)*Math.PI)*150;
			var xLoc = 300 + locList[i%25].y*200; //(pRand()*50)+275 + Math.cos((i*1.29)*Math.PI)*200;

			this.nodes[i].setLocation(xLoc, yLoc);
			
			}
			return;
		}
		
		//pick a random location within a rotating quadrant
		var numRows=3;
		var numCols=3;
		var width=600;
		var height=400;
		var cellWidth = width/numCols;
		var cellHeight = height/numRows;
		var grid = [];
		for(var r=0; r<numRows; r++){
			for(var c=0; c<numCols; c++){
				var cell = {xMin: (c*cellWidth), xMax: ((c+1)*cellWidth), yMin:(r*cellHeight), yMax:((r+1)*cellHeight)};
				grid.push(cell);
				if(r==1 && c==1) grid.pop(); //pop center cell
			}
		}
		
		for(var i=0; i<this.nodes.length; i++){
			var q = grid[i%grid.length];
			var xLoc = randBetween(q.xMin, q.xMax);
			var yLoc = randBetween(q.yMin, q.yMax);
			
			this.nodes[i].setLocation(xLoc, yLoc);
		
			
		}
		
		
	}
	
	function addNode(Name){
		temp=new Node(Name);
		//console.debug("just created node: "+JSON.stringify(temp))
		this.nodes.push(temp);
		return temp;
	}
	
	function removeNode(Name){
		
		var nodeToRemove=this.getNodeByName(Name);
		var index = this.nodes.indexOf(nodeToRemove);
		
		if(index>-1){
			this.nodes.splice(index,1); // remove from node list

			for (var i = 0; i < this.nodes.length; i++) { // remove from adjLists, weights, etc.
				var index2 = this.nodes[i].adjList.indexOf(nodeToRemove);
				if(index2>=0){
					this.nodes[i].adjList.splice(index2,1);
					this.nodes[i].weight.splice(index2,1);
					this.nodes[i].selectedEdges.splice(index2,1);
				}
			}
		}
		
	}
	
	function getNodeByName(Name){
		
		for(var i=0; i<this.nodes.length; i++){
			if(this.nodes[i].name==Name) return this.nodes[i];
		}
		return null;
	}
    
    // return the node - if any - sitting under this x,y coordinate
    this.getMouseoverNode = function(x, y){
        
        for(var i=0; i<this.nodes.length; i++){
            if(this.nodes[i].contains(x,y)){
                return this.nodes[i];
            }
  
        }
        return null;
        
    }
    
    this.addEdge = function(fromNode, toNode, weight){
    //	console.debug("G.addEdge "+fromNode+" -> "+toNode+" : "+weight );
    	fromNode.addEdge(toNode, weight);
    	
    	if(this.isUndirected){
    	//	console.debug("undirected so adding edge in reverse dir");
    		toNode.addEdge(fromNode, weight);
    	}
    	
    	
    }

	function getAllNodes(){
		return this.nodes;
	}
	
	this.getMouseoverEdge = function(x,y){
		
		//for every edge, 
		for(var i=0; i<this.nodes.length; i++){
			this.nodes[i].hoverEdge=-1;
            for(var e=0; e<this.nodes[i].adjList.length; e++){
            	
            	var p1 = this.nodes[i];
                var p2 = this.nodes[i].adjList[e];
               
               	//calc dists between mouse x,y and p1 and p2
               	var mouseDist = Math.sqrt( Math.pow(x-p1.x,2) + Math.pow(y-p1.y,2));
                mouseDist += Math.sqrt( Math.pow(x-p2.x,2) + Math.pow(y-p2.y,2));
                
               	var actualDist = Math.sqrt(Math.pow(p1.x-p2.x,2)+Math.pow(p1.y-p2.y,2));

               	// if sum of dists is close to actual dist between p1 and p2 then mouse is close to line
                if(Math.abs(mouseDist-actualDist) < 0.1){
                //	console.debug("near edge between "+p1.name+" and "+p2.name);
                	
                	//this.nodes[i].selectedEdges[e]=true;
                	this.nodes[i].hoverEdge = e;
                }
                //else this.nodes[i].selectedEdges[e]=false;
            }
  
        }
        return null;
        
		
			//calulate its slope m
			// figure out what y should be...targetY = m*x;
			// see if param y+/- 2 of that
		
	}
	
	
	
	//handling mouse event might trigger other events related
	// to nodes and edges
	var currentNode = null;
	this.handleMouseEvent = function(evt){
		var result = false;
		console.debug(evt.type);
		if(evt.type=="mousemove"){
			
		 	this.getMouseoverEdge(evt.offsetX, evt.offsetY);
			
			if(currentNode != null && currentNode.isDrag==true && this.canDragNodes){
				currentNode.x = evt.offsetX-10;
				currentNode.y = evt.offsetY-10;
			}
			else{
				if(currentNode!=null) currentNode.isHover=false;
				
				currentNode = this.getMouseoverNode(evt.offsetX, evt.offsetY);
				if(currentNode!=null) currentNode.isHover=true;

			}
		}
		else if(evt.type=="mousedown"){
			if(currentNode!=null) currentNode.isDrag=true; //
		}
		else if(evt.type=="mouseup"){
			console.debug(evt)
			if(currentNode!=null){
				currentNode.isDrag=false;
				currentNode.isHover=false;
				
			}
		}
		else if(evt.type=="dblclick"){ //select a Node is one is highlighted, otherwise and edge if one is close to mouse
			
			if(currentNode != null){  //if they double clicked and there's a current node, it means they clicked on a node.
				
				currentNode.isSelected = !currentNode.isSelected; //toggle selected
				
				if(this.autoEdgeSelection==true){ //if this node was just selected and auto-edge is on, then turn on
					console.debug("should turn on edges for "+currentNode.name);
					
					//for every nbr connected to this node
					for(var i=0; i<currentNode.adjList.length; i++){
						var nbr = currentNode.adjList[i];
						
						//if undirected and this node is now off AND nbr is off then turn off edge
						if(this.isUndirected){
							console.debug("\t unDiGrpah so...");
							if(currentNode.isSelected == false && nbr.isSelected == false ){
								this.setEdgeSelected(currentNode, nbr, false);
							}
							else{
								// else leave edge on
								this.setEdgeSelected(currentNode, nbr, true);
							}
						}
						else{ // else it's a directed edge, turn on/off appropriately.  NOTE: can't use toggle here, because we don't know state of edge first
							if(currentNode.isSelected == true){
								this.setEdgeSelected(currentNode, nbr, true);
							}
							else{
								this.setEdgeSelected(currentNode, nbr, false);

							}
							
						}
						
					}
				}
			}//end if dblclick was on a node
			else if(this.edgeSelectionOn==true){ //otherwise if edge selection is on, see if it's an edge that was selected
				console.debug("inside edgeSolectionOn....")
				for(var i=0; i<G.nodes.length; i++){
					var N = G.nodes[i];
					
					if(N.hoverEdge!=-1){ //toggle hover edge
						console.debug("Selected edge for Node "+N.name);
						var isOn = N.selectedEdges[N.hoverEdge];
						//this.toggleEdgeSelected(N, N.adjList[N.hoverEdge]); //let graph select edge in order to record acuumulated weight
															  // this way don't need to recount weight on every draw!
						//N.selectedEdges[N.hoverEdge]= !N.selectedEdges[N.hoverEdge];
						this.setEdgeSelected(N, N.adjList[N.hoverEdge], !isOn); //toggle it
					}
				}
			}	
		}
		
		return result;
	}
	
	this.setEdgeSelected = function(fromNode, toNode, onoff){
		
			console.debug("turning edge: "+fromNode.name+" <--> "+toNode.name +" on? "+onoff);
			
			var edgeNum = fromNode.getEdgeIndex(toNode);
			console.debug("\tverify edgeNum: "+toNode.name + " ? "+fromNode.adjList[edgeNum].name);
			
			fromNode.selectedEdges[edgeNum] = onoff; //!fromNode.selectedEdges[edgeNum]; //toggle
			console.debug("\tselected edge: "+edgeNum+" to "+onoff+" verify: "+fromNode.selectedEdges);
			
			if(this.isUndirected){
				var nbrEdgeNum = toNode.getEdgeIndex(fromNode);
				toNode.selectedEdges[nbrEdgeNum] = onoff;
				console.debug("\tUndirected graph. Setting "+toNode.name+"->"+fromNode.name+" to "+onoff+". Verify: nbrindex: "+nbrEdgeNum+" seledges: "+toNode.selectedEdges);
				
				toNode.hoverEdge=-1; //KLUGE!   The dblClick code will fire once for each edge that is being hovered over
								     //			Since undirected edges are implemented as two directed edges, we need to turn
								     //			off the one of the edges being hovered over so that the loop doesn't trigger it. 
			}
			
		
			var weightToAdd = fromNode.weight[edgeNum];
			
			//handles undirected edge weight counting -- if undirected, then only count weight in one direction 
			if(this.isUndirected && fromNode.name > toNode.name){
				weightToAdd=0;
			}
			
			if(fromNode.selectedEdges[edgeNum]==true){ //if this edge was turned on, add the weight
				this.totalWeight += weightToAdd;
			}
			else this.totalWeight -= weightToAdd;
			
			
			
			console.debug("total Weight is: "+this.totalWeight)
		
	}
	
	this.toggleEdgeSelected = function(fromNode, toNode){
		
		if(fromNode!=null && toNode!=null ){
			
			var edgeNum = fromNode.getEdgeIndex(toNode);
			this.setEdgeSelected(fromNode, toNode, !fromNode.selectedEdges[edgeNum]);
			
			
			////---- WEIRD...because edges are drawn doubly, we don't need to toggle partner edge in undirected graph because both edges are under mouse
			// if(this.isUndirected == true){
			// 	var nbrEdgeNum = toNode.getEdgeIndex(fromNode);
			// 	toNode.selectedEdges[nbrEdgeNum] = !toNode.selectedEdges[nbrEdgeNum]; //toggle pair edge
			// }
			
			
		}
	
	}
	
	this.draw = function(canv){
                
        var ctx = canv.getContext("2d");
        ctx.fillStyle="#FFFFFF";
        //console.debug("drawing big white rect(0,0,"+canv.width+","+canv.height+")");
        ctx.fillRect(0,0,canv.width,canv.height);
                
        //Draw all edges first, because we want nodes to appear on top of the lines.
        for(var i=0; i<G.nodes.length; i++){
           var N = G.nodes[i];
           	for(var e=0; e<N.adjList.length; e++){
           		ctx.beginPath();

           		ctx.moveTo(N.x,N.y);
           		var nbr = N.adjList[e];
				ctx.lineTo(nbr.x,nbr.y);
				//if(N.selectedEdges[e]==true) ctx.strokeStyle="#00FF00";
				var textX = ((nbr.x-N.x)/2)+N.x+4;
				var textY = ((nbr.y-N.y)/2)+N.y+4;

			
				if(N.selectedEdges[e]){
					ctx.strokeStyle = this.edgeSelectedColor;
				}
				else if(N.hoverEdge==e) ctx.strokeStyle= this.edgeHoverColor;
				else ctx.strokeStyle = this.edgeColor;
				//console.debug("drawing edge between: "+N.name+" and "+nbr.name+" in color "+ctx.strokeStyle);
				ctx.stroke();
				
				var weightTextOpacity = 1.0;
				
				//condition under which we make weight text invisible
				if(this.showWeightOnlyWhenSelected && N.selectedEdges[e]==false && N.hoverEdge!=e){
					weightTextOpacity = 0.0;
				}

				if(this.showWeights){

				//	ctx.fillStyle="rgba(255,255,255,"+weightTextOpacity+")";
				//	ctx.fillText(N.weight[e], textX, textY);
					ctx.fillStyle="rgba(0,0,0,"+weightTextOpacity+")";
					ctx.fillText(N.weight[e], textX-1, textY-1);
				}
       		}
       		//ctx.closePath();
         }
         
         //Then draw nodes
         for(var i=0; i<G.nodes.length; i++){
			G.nodes[i].draw(ctx);
       		N.draw(ctx);
       		
         }
         if(this.showWeights){
	         ctx.fillStyle = "#000000";
	         ctx.fillText("Total: "+this.totalWeight.toFixed(2), 5, canv.height-5);
         }
         ctx.fillStyle="#000000";
       //  console.debug("putting statustext at x="+(canv.width-parseInt(ctx.measureText(this.statusText))-5));
         ctx.fillText(this.statusText, canv.width-ctx.measureText(this.statusText).width-5, canv.height-5);
    
		if(this.graphNum!=""){
			ctx.fillText("Graph# "+this.graphNum, canv.width-ctx.measureText("Graph # "+this.graphNum).width-5,20)
		}
		
	}
}

function Node(Name){
	this.name=Name;
	this.adjList=[];
	this.weight=[];
	this.hoverEdge=-1; //index of edge if being hovered over
	this.selectedEdges=[]; //click selected
	this.addEdge=addEdge;
	this.compare=compare;
	this.contains = contains;
	this.x = parseInt(pRand()*550)+25;
	this.y = parseInt(pRand()*350)+25;
	this.isHover = false;
	this.isDrag = false;
	this.isSelected = false;
	this.fillStyle = "#990000"; //"rgba(255,0,0,0.5)";
	this.hoverStyle = colorLuminance(this.fillStyle, 0.5);
	this.size = 20;
	this.originalX = -1;
	this.originalY = -1;
	
	
	this.setRandLocation = function(){
		var x = parseInt(pRand()*550)+25;
		var y = parseInt(pRand()*350)+25;
		this.setLocation(x,y);
	}
	
	this.setLocation = function(x,y){
		this.x = x;
		this.y = y;
		if(this.originalX==-1){
			this.originalX = this.x;
			this.originalY = this.y;
		}
	
	}
	
	this.setSize = function(s){ this.size = s; }
	
	this.setColor = function(hex){
		this.fillStyle=hex;
		this.hoverStyle = colorLuminance(hex, 0.5);
		console.debug("color: "+hex+ " highlight: "+this.hoverStyle);
	}
	
	this.numSelectedEdges = function(){
		var count=0;
		for(var i=0; i<this.selectedEdges.length; i++){
			if(this.selectedEdges[i]==true) count++;
		}
		return count;
	}
	function addEdge(neighbour,weight){
		this.adjList.push(neighbour);
		if( typeof(weight)=="number"){
			weight = weight.toFixed(1); //round to nearest 10th...but also addes a decimal to ints (arg)

			//if the resulting string has a .0 then parse it as an int.
			if(weight.indexOf(".0") >=0) weight = parseInt(weight);
			else weight = parseFloat(weight);
		}
		this.weight.push(weight);
		this.selectedEdges.push(false);
	
	}
	
	this.getEdgeIndex = function(nbrNode){
		
		for(var i=0; i<this.adjList.length; i++){
			if(this.adjList[i].name==nbrNode.name){
				return i;
			}
		}
		return -1;
	}
	
	//toggle the edge and return the index of the edge that was turned on/off
	this.toggleEdgeSelected = function(nbrNode){
		
		var edgeI = getEdgeIndex(nbrNode);
		
		if(edgeI != -1){
			this.selectedEdges[edgeI] = !this.selectedEdges[edgeI];
		}
		return edgeI;
	}
	
	this.setEdgeSelected = function(nbrNode, onoff){
		var edgeI = getEdgeIndex(nbrNode);
		
		if(edgeI != -1){
			this.selectedEdges[edgeI] = onoff;
		}
	
		return edgeI;
	}
	
	this.containsEdge = function(node){
		for(var i=0; i<this.adjList.length; i++){
			if(this.adjList[i].name==node.name) return true;
		}
		return false;
	}

	// function getAdjList(){
	// 	return adjList;
	// }
	function compare(node2){
		return this.weight-node2.weight;
	}
	function contains(x,y){
		//Since node is a circle, if dist of x,y from this.x,y, is < radius
		// NOTE: this.size = radius of circle
	   var dist = Math.sqrt( Math.pow(this.x-x,2) + Math.pow(this.y-y,2));

	    return dist<this.size;
	}
	
	this.draw = function(ctx){
		ctx.imageSmoothingEnabled=true;
		ctx.fillStyle = this.fillStyle;
		if(this.isHover || this.isSelected) ctx.fillStyle = this.hoverStyle;
		
	//	ctx.fillRect(this.x, this.y, this.s)
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.size,0,2*Math.PI);
		ctx.closePath();

		ctx.fill();
		ctx.fillStyle="#FFFFFF";
		var textWidth = ctx.measureText(this.name).width;
		ctx.fillText(this.name,this.x-(textWidth/2),this.y+3);
	}
}

function colorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}
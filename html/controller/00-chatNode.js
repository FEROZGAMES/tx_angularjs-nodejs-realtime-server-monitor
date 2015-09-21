'use strict';

angular.module('resumen').controller('chatNode',['$scope','$timeout','$interval','$compile',function($scope,$timeout,$interval,$compile){
	
	angular.element(document).ready(function () {

  		$scope.serversNames = [];
		//  object for generated NEW GRAFS in real time
		var myGrafs = {}; // myGrafs.Servidor1 ={}

		//  for introduce the value PHP value in HASH
		var myData = {}; // myData.Servidor1 = []
		
		//  for generate line in the grafo for each different variables
		var lineGraf = {}; // lineGraf.Servidor1 = []

		// for control the new variables for server
		var myVariables = {}; // myVariables.Servidor1 = []

		// bit timeout => for changue the src to RED at 3 seconds if no return new information
		$scope.imgBitTimeout = {};
		// for delete data from PROVIDER
		$scope.deleteData = {};
		
		// for connect o disconnect button
		var connect = false;
		// connect disconnect of the WS
		$scope.controlconexion = function(){
			if (connect === true){
				socket.emit('eixit');
			}else{
				socket.connect();
			} // final del If
		};
		// select DOM element for time rage of the CHARTs
		$scope.timeRange = [
			{ 'range': 10000, 'title': '10 seconds'},
			{ 'range': 30000, 'title': '30 seconds'},
			{ 'range': 60000, 'title': '1 minut'},
			{ 'range': 450000, 'title': '5 minuts'},
			{ 'range': 6000000, 'title': '10 minuts'},
			{ 'range': 18000000, 'title': '30 minuts'},
			{ 'range': 24450000, 'title': '45 minuts'},
			{ 'range': 36000000, 'title': '1 hour'},
			{ 'range': 72000000, 'title': '2 hours'}
		];
		$scope.rangeTime = $scope.timeRange[0].range;

		var socket = io.connect('http://192.168.1.201:64500');
		socket.on('connect', function (data) {
			connect = true;
			$scope.$apply(function () {
				$scope.userConnect = "/img/verde_fijo.png";
				$scope.buttonConnect = "Connect at WS";
			});
			socket.emit('addRoom');
		});
		// when 'getservers' modify '$scope.serversNames'
		socket.on('getservers', function (data) {
			//console.log('connect and getservers: ',data);
			if(typeof data === 'string'){
				alert(data);
			}else{ // is array
				if($scope.serversNames.length === 0){
					// send STRING (server name) for create new server
					for (var i = 0; i < data.length; i++) {
						var control = createServers(data[i]);
					}
				}
			}
		});
		socket.on('recivePHP', function(data){
			//console.log('recivePHP',data); // {serverName: "Servidor01", ESTABLISHED: 30, LISTEN: 40, pepe: 50, date: 1442243291171}
			var keys = Object.keys(data); // ['serverName', 'ESTABLISHED', 'LISTEN','date']
			var server = data.serverName; // "Servidor1"

			var testServer = $scope.serversNames.indexOf(server);
			if (testServer === -1){
				console.log('NEW server: ',server);
				/*// meto el servidor en la variable
				$scope.serversNames.push(server);*/
				var control = createServers(server);
			}
			
			delete data.serverName; // delete the name of server => {ESTABLISHED: 30, LISTEN: 40, pepe: 50}
			var newsKeys = Object.keys(data); // ['ESTABLISHED', 'LISTEN']
			
			if(myVariables[server] === undefined){
				myVariables[server] = [];
			}
			// for show in CONSOLE
			var dataConsole ="";
			// para cada VARIABLE compruebo si existe su GRAF y si no lo creo
			for (var i=0; i < newsKeys.length; i++) {
				if (newsKeys[i] !== 'date') {
					// si el valor de la VARIABLE no existe... la creo
					var testVariable = myVariables[server].indexOf(newsKeys[i]);
					if (testVariable === -1){
						// creo el registro de la variable
						myVariables[server].push(newsKeys[i]);
						// creo la GRAF (lineGraf)
						lineGraf[server][newsKeys[i]] = {};
						lineGraf[server][newsKeys[i]] = new CreateLineGraf(server,newsKeys[i]);
						// añado la GRAF a su correspondiente CHART
						myGrafs[server].chart.addGraph(lineGraf[server][newsKeys[i]].graph);
					}
					// for show in CONSOLE
					dataConsole = dataConsole + newsKeys[i]+":"+data[newsKeys[i]]+"; ";
				}
			}
			
			// PARA CARGAR EL DATAPROVIDER USAR ESTO:
			//myData[server].push(data);

			//  adds new items to the end of an array
			myGrafs[server].chart.dataProvider.push(data);
			//should be called after provider changed
			myGrafs[server].chart.validateData();
			
			// bit
			$scope.$apply(function () {
				var element = angular.element( document.querySelector( '#img'+server ) );
				element.attr("src","/img/btn_verde.gif");
				if($scope.imgBitTimeout[server] !== undefined){
					$timeout.cancel( $scope.imgBitTimeout[server] );
				}
				$scope.imgBitTimeout[server] = $timeout(function(){
					var element2 = angular.element( document.querySelector( '#img'+server ) );
					element2.attr("src","/img/rojo_fijo.png");
				}, 3000);
			});

			// send to CONSOLE
			// new hour
			var currDate = new Date();
			var horaActual = formatTime(currDate.getHours()) + ":" + formatTime(currDate.getMinutes()) + ":" + formatTime(currDate.getSeconds());
			var htmlEnvio = "--- "+ horaActual +' ---<br>';
			dataConsole = dataConsole +'<br>';
			$("#console"+server+" p").after(dataConsole);
			$("#console"+server+" p").after(htmlEnvio);

			var htmlConsoleAll = "--- "+ horaActual +' ' +server+ ' ---<br>';
			$(".consoleAll p").after(dataConsole);
			$(".consoleAll p").after(htmlConsoleAll);
		});
		socket.on('disconnect', function(data){
			connect = false;
			$scope.$apply(function () {
				$scope.userConnect = "/img/rojo_fijo.png";
				$scope.buttonConnect = "Your are DESCONNECT of WS";
			});
		});
		socket.on('reconnecting', function(data){
			$scope.$apply(function () {
				$scope.userConnect = "/img/btn_rojo.gif";
				$scope.buttonConnect = "Reconnecting at WS";
			});
		});
		socket.on('reconnect_failed', function(data){
			connect = false;
			$scope.$apply(function () {
				$scope.userConnect = "/img/rojo_fijo.gif";
				$scope.buttonConnect = "Reconnecting FAILED at WS";
			});
		});

		function formatTime(num){

			return (num <= 9)? ("0"+num) : num;
		}

		function showConsole(server){
			var totalConsoles = $(".consoleChart").length;
			for (var i = 0; i < totalConsoles; i++) {
				$(".consoleChart").eq(i).addClass("dNone");
			}
			$("#console"+server).removeClass("dNone");
		}

		function moveChart(server){
			var myElement = $("#mov"+server);
			var offsetelement = myElement.offset();
			var myOffset = offsetelement.top;

			var numClass = $(".moveButton").length;
			// for each element...
			for (var i = 0; i < numClass; i++) {
				var element = $(".moveButton").eq(i);
				var oneElement = element.offset();
				var elementOffset = oneElement.top;

				if ( elementOffset < myOffset ){
					var elementAltDiv = element.outerHeight();// 397 at full screem
					var newOffset = elementOffset + elementAltDiv;
					element.animate({"top":newOffset+"px"}, "slow");
				}

				var offsetDivContenedor = $('#divCharts').offset();
				var offsetdivParent = offsetDivContenedor.top;
				myElement.animate({"top":offsetdivParent+"px"}, "slow");
			}
		}

		function positionStart(server){
			var heightChart = 397; // 397 at full screem
			var offsetDivContenedor = $('#divCharts').offset();
			var offsetContenedor = offsetDivContenedor.top;

			var numClass = $(".moveButton").length;
			if (numClass === 1) {
				$('#mov'+server).css("top",offsetContenedor);
			}else{
				var apllyOffset = ((numClass-1) * heightChart)+offsetContenedor;
				$('#mov'+server).css("top",apllyOffset);
			}
		}

		function createServers(serverName){
			$scope.serversNames.push(serverName);
			// new DIV for new CHART
			var htmlDIV = '<div id="mov'+serverName+'" class="moveButton" style="width: 100%;position:absolute;padding-right:5px;"><hr><p class="mLeft10">'+serverName+'<button id="showConsole'+serverName+'" class="mLeft10 btn btn-sm btn-default">Show console</button><a href="/filtrar" target="_blank" class="mLeft10">Filtrar datos</a></p><div id="'+serverName+'" style="width: 100%; height: 340px;"></div></div>';
			$("#divCharts").append(htmlDIV);

			// new LI for new BOTTOM
			var htmlButton = '<li class="fLeft"><button class="mLeft10 btn btn-sm btn-info" id="button'+serverName+'" ng-click="moveGraf()">'+serverName+'</button><img id="img'+serverName+'" class="mLeft10" src="/img/btn_naranja_fijo.png" ></li>';
			$("#buttonMonitor").append(htmlButton);

			// new CONSOLE for Chart
			var htmlConsole = '<div id="console'+serverName+'" class="consoleChart"><p>### Console '+serverName+' ###</p></div>';
			$("#divConsole").append(htmlConsole);

			positionStart(serverName); // for div element
			
			$('#button'+serverName).click(function(){ // listener for CLICK
				moveChart(serverName);
			});

			$('#showConsole'+serverName).click(function(){ // listener for CLICK
				showConsole(serverName);
			});			

			// genero el hueco para introducir la información
			myData[serverName]=[];
			// genero un CHART por servidor
			myGrafs[serverName] = new CreateGraf(serverName);
			// genero un lineGraf por servidor para introducir sus respectivas variables
			lineGraf[serverName] = {};
			// activar borrado de datos
			deleteDataTime(serverName);
			//console.log('createServers END!!!');
			return true;
		}

		function CreateGraf(data) { // data = nameServer
			// SERIAL CHART    
			this.chart = new AmCharts.AmSerialChart();
			this.chart.pathToImages = "http://www.amcharts.com/lib/images/";
			this.chart.marginTop = 25;
			//this.chart.marginBottom = 2;
			this.chart.marginRight = 10;
			this.chart.autoMarginOffset = 5;
			this.chart.zoomOutButton = {
				backgroundColor: '#000000',
				backgroundAlpha: 0.15
			};
			if(myData[data] === undefined){
				myData[data] = [];
			}
			this.chart.dataProvider = myData[data]; // NO LO USAS
			this.chart.categoryField = "date"; // se engancha en la fecha
			this.chart.theme = "default";
			this.chart.startDuration = 1;

			this.chart.titles = [
				{
					//"id": "Title-1",
					"size": 15,
					"text": data
				}
			];

			this.chart.personalColors = ["orange","green","blue","purple","plum","black","orangeRed","orchid","royalBlue","saddleBrown","salmon","seaGreen","skyBlue","springGreen","wheat","paleGreen","navy","olive","paleVioletRed","yellow","peru"];

			// LEGEND
			var legend = new AmCharts.AmLegend();
			legend.equalWidths = false;
			legend.periodValueText = "total: [[value.sum]]";
			legend.position = "bottom";
			legend.valueAlign = "left";
			legend.valueWidth = 100;
			this.chart.addLegend(legend);

			// AXES
			// category
			var categoryAxis = this.chart.categoryAxis;
			// como nuestros datos están basado en la fecha... establecemos "parseDates" a TRUE
			categoryAxis.parseDates = true;
			// etablecemos el periodo de nuestros datos...
			// fff->mlsc, ss->sc, mm->minute, hh->hour, DD->day, MM->month, YYYY->year
			categoryAxis.minPeriod = "fff";
			//categoryAxis.dashLength = 1;
			//categoryAxis.gridAlpha = 0.15;
			categoryAxis.axisColor = "#DADADA"; // grey

			// VALLUE
			var valueAxis = new AmCharts.ValueAxis();
			valueAxis.axisAlpha = 0.2;
			valueAxis.dashLength = 1;
			valueAxis.title = "Number connexion";
			this.chart.addValueAxis(valueAxis);

			// CURSOR
			var chartCursor = new AmCharts.ChartCursor();
			chartCursor.cursorPosition = "mouse";
			this.chart.addChartCursor(chartCursor);

			// 'id' element DOM to write inside
			this.chart.write(data);
		}

		function CreateLineGraf(server,line){
			//console.log('dentro de CreateLineGraf: '+server+', '+line);
			// GRAPH
			this.graph = new AmCharts.AmGraph();
			// Title in 'legend'
			this.graph.title = line;
			// name of variable to link
			this.graph.valueField = line;
			
			this.graph.balloonText = "[[title]]: [[value]]"; // "[[title]] of [[category]]:[[value]]";
			//this.graph.bullet = "round"; // los puntos REDONDOS de cada pico
			
			this.graph.bulletBorderColor = "#FFFFFF"; // WHITE
			//graph.bulletBorderThickness = 2;
			this.graph.lineThickness = 2;

			this.graph.lineColor = myGrafs[server].chart.personalColors[0]; // assig the first element "#03B818"
			var cortar = myGrafs[server].chart.personalColors; // delete the first element
			cortar.splice(0,1);
			myGrafs[server].chart.personalColors = cortar; // return array whitout the first element

			// color negative line: RED
			this.graph.negativeLineColor = "red"; // "#b5030d"
			// esto hace que lA gráfica oculte los 'bullets' cuando
			// hay más de 50 series en la selección
			this.graph.hideBulletsCount = 50;
			/*$scope.myGrafs[server].addGraph($scope.lineGraf[line]);
			chart.addGraph(graph);*/
		}
		
		function deleteDataTime(nameServer){
			// exista o no lo arranco
			$scope.deleteData[nameServer] = $interval(function(){
				// borro información
				myGrafs[nameServer].chart.dataProvider.forEach(function(value){
					var time = new Date().getTime(); // ml
					// 10000 ml => 10 sg // 60000 => 1 minuto // 3600000 => 1 hora // 
					if ( value.date <= (time - $scope.rangeTime) ){ // $scope.rangeTime 10000
						// removes the first item of an array
						myGrafs[nameServer].chart.dataProvider.shift();
					}
				});
				myGrafs[nameServer].chart.validateData(); //should be called after provider changed			

			}, 1000);
		}// end de FUNCTION

	}); // END angular.document.ready	
}]); // END CONTROLLER
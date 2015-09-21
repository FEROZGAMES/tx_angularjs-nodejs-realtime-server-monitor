'use strict';

angular.module('resumen', ['ngAnimate','ui.bootstrap']);

angular.module('resumen').controller('filtrar',['$scope','$interval','$log',function($scope,$interval,$log){

    // object for create the CHART
    var chart = {};
    var personalColors = ["orange","green","blue","purple","plum","black","orangeRed","orchid","royalBlue","saddleBrown","salmon","seaGreen","skyBlue","springGreen","wheat","paleGreen","navy","olive","paleVioletRed","yellow","peru"];
    // dataProvider
    var chartData = [];
    // for control the Grafs
    var myGrafs = {};
    // for control variables for GRAFS
    var myVars = [];

    $scope.optionsHoursLess =[1,2,3,4,5,6,7,8,9,10,11,12];
    $scope.hoursLess = $scope.optionsHoursLess[0];

    // ### HOURPIKER ###
    // ng-model="mytime"
    $scope.mytime = {};
    // SETs hour-step="hstep" minute-step="mstep"
    $scope.hstep = 1;
    $scope.mstep = 15;
    // show/hide AM => show-meridian="ismeridian"
    $scope.ismeridian = false; // hour in format 15:00 BEST!!!
    $scope.toggleMode = function() {
        $scope.ismeridian = ! $scope.ismeridian;
    };
    // button NOW
    $scope.clearHourStart = function() {
        $scope.mytime.start = new Date();
    };$scope.clearHourStart();
    $scope.clearHourEnd = function() {
        $scope.mytime.end = new Date();
    };$scope.clearHourEnd();
    // ### END HOURPIKER ###

    // ### DATEPIKER ###
    $scope.dt = {};

    // SET maxim/min date to show => TODAY
    $scope.minDate = new Date("September 01, 2015 00:00:00");   //min-date="minDate"
    $scope.maxDate = new Date();
    // START date   
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    // $scope.dt.start = yesterday;
    $scope.dt.start = new Date();
    // test OLD $scope.dt.end
    $scope.$watch('dt.start', function(newValue, oldValue, scope) {
        if (newValue === oldValue) {
          return; // la primera vez que se ejecuta n hará nada
        }
        if ($scope.dt.start > $scope.dt.end) {
            $scope.dt.end = $scope.dt.start;
        }
    });
    // END date
    $scope.dt.end = new Date();
    // FORMAT of date for both
    $scope.formats = ['dd-MM-yy','dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    // options
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    // by DEFAULT show windows open/true o close/false
    $scope.statusStart = { opened: false };
    $scope.open1 = function($event) {

        $scope.statusStart.opened = true;
    };
    $scope.statusEnd = { opened: false };
    $scope.open2 = function($event) {

        $scope.statusEnd.opened = true;
    };
    // BUTTONs down
    $scope.todayDateStart = function(){

        $scope.dt.start = new Date();
    };
    $scope.todayDateEnd = function(){

        $scope.dt.end = new Date();
    };
    $scope.clearDateStart = function(){

        $scope.dt.start = null;
    };
    $scope.clearDateEnd = function(){

        $scope.dt.end = null;
    };
    // ### END DATEPICKER ###

    var socket = io.connect('http://101.101.101.101:80');
    socket.on('connect', function (data) {
        
        socket.emit('addRoom');
    });
    // when 'getservers' modify '$scope.serversNames'
    socket.on('getservers', function (data) {
        console.log("connect and :",data);
        if(typeof data === 'string'){
            alert(data);
        }else{ // is array
            $scope.$apply(function () {
                $scope.allServer = data;
                // for ng-init in the select DOM element
                $scope.selectedServer = $scope.allServer[0];
            });
        }
    });
    socket.on('newServer', function (data) {

        serverPush(data);
    });

    // for TIME update in the client
    $interval(function(){
        var horaActual = new Date();
        $scope.hActual = horaActual.toLocaleString();
        $scope.hActualMLS = horaActual.getTime();
    }, 1000);

    $scope.getFilterData = function(){
        var ds = {};
        ds.dStart = $scope.dt.start;
        ds.day = ds.dStart.getDate();
        ds.month = ds.dStart.getMonth();
        ds.year = ds.dStart.getFullYear();
        ds.hStart = $scope.mytime.start;
        ds.sc = ds.hStart.getSeconds();
        ds.minut = ds.hStart.getMinutes();
        ds.hour = ds.hStart.getHours();
        var dateStart= new Date(ds.year, ds.month, ds.day, ds.hour, ds.minut, ds.sc);
        var dateStartML = dateStart.getTime(); //1441874854000

        var de = {};
        de.dStart = $scope.dt.end;
        de.day = de.dStart.getDate();
        de.month = de.dStart.getMonth();
        de.year = de.dStart.getFullYear();
        de.hStart = $scope.mytime.end;
        de.sc = de.hStart.getSeconds();
        de.minut = de.hStart.getMinutes();
        de.hour = de.hStart.getHours();
        var dateEnd = new Date(de.year, de.month, de.day, de.hour, de.minut, de.sc);
        var dateEndML = dateEnd.getTime();

        if (dateStartML > dateEndML) {
            alert("Bad selection range");
        }else{
            // API => getData(server,hStart,hEnd);
            //console.log($scope.selectedServer+' '+dateStartML+' '+dateEndML);
            getData($scope.selectedServer,dateStartML,dateEndML);
        }
    };
    
    // push new server in the SELECT DOM element
    function serverPush(server){
        $scope.$apply(function () {
            if ($scope.allServer === undefined) { $scope.allServer = []; }
            $scope.allServer.push(server);
        });
    }
    // for calculate las hours and launch filtrar();
    $scope.getLastHours = function(){
        var unaHora = 1000*60*60;
        var hAtras = $scope.hActualMLS - ($scope.hoursLess * unaHora);
        // API => getData(server,hStart,hEnd);
        getData($scope.selectedServer,hAtras,$scope.hActualMLS);
    };
    // function for get data from API
    function getData(server,hStart,hEnd){
        $.ajax({
            url:"/api", //http://192.168.1.201:64500
            type: 'GET',
            timeout: 12000,
            dataType: 'json',
            headers: {
                    server : server,
                    timein : hStart,
                    timefinish: hEnd
                },
            success:function(datos,status){
                dataProcess(datos);
                // inserto en el div
                $('.ajax').html('<p>'+JSON.stringify(datos)+'</p>');
                
                // en caso de error...
                if(status !=="success"){
                    console.log("Un error ha ocurrido, bad STATUS: "+status);
                }
            },
            error:function(xhr){
                console.log("Un error ha ocurrido: " + xhr.status + " -> " + xhr.statusText);
            },
            complete:function(){
                //reciveAll();
            }
        }); // FINAL $.AJAX
    }
    // procces of data
    function dataProcess(data){
        
        var long = myVars.length;
        if (long > 0) {            
            for (var i = 0; i < long; i++) {
                var eraseGraph = chart.graphs.pop();
                //chart.removeGraph(eraseGraph);
            }
        }
        personalColors = ["orange","green","blue","purple","plum","black","orangeRed","orchid","royalBlue","saddleBrown","salmon","seaGreen","skyBlue","springGreen","wheat","paleGreen","navy","olive","paleVioletRed","yellow","peru"];
        myVars = [];
        chart.dataProvider = [];

        // borro la info del div
        $('.ajax').html('');

        for (var i = 0; i < data.length; i++) { // first level { "_id" : ObjectId("55f835d8c17294180e000015")...
            // obtengo las keys de cada register
            var keys =Object.keys(data[i]); //"_id" "serverName" "date" "__v"
            for (var h = 0; h < keys.length; h++) {
                // si no es igual a estos valores que no me interesa...
                if(keys[h] !== "_id" && keys[h] !== "serverName" && keys[h] !== "date" && keys[h] !== "__v" ){
                    // compruebo si lo tengo guardado
                    var testVar = myVars.indexOf(keys[h]);
                    if (testVar === -1){
                        myVars.push(keys[h]);
                        myGrafs[keys[h]] = new CreateGraf(keys[h]);
                        chart.addGraph( myGrafs[keys[h]].graph );
                    }
                }
            }
            chart.dataProvider.push(data[i]);
        }
        chart.validateData();
    }

    angular.element(document).ready(function () {

        createChart();
    }); // END angular.document.ready
    
    function CreateGraf(line){
        // GRAPH
        this.graph = new AmCharts.AmGraph(); //
        // Title in 'legend'
        this.graph.title = line; //
        // name of variable to link
        this.graph.valueField = line; //
        //this.graph.bullet = "round"; // los puntos REDONDOS de cada pico
        this.graph.bulletBorderColor = "#FFFFFF"; // WHITE //
        //this.graph.bulletBorderThickness = 2;
        // esto hace que lA gráfica oculte los 'bullets' cuando
        // hay más de 50 series en la selección
        this.graph.hideBulletsCount = 50; //
        this.graph.lineThickness = 2; //

        this.graph.lineColor = personalColors[0]; // assig the first element "#03B818" //
        var cortar = personalColors; // delete the first element
        cortar.splice(0,1);
        if(cortar.length === 0){
            personalColors = ["orange","green","blue","purple","plum","black","orangeRed","orchid","royalBlue","saddleBrown","salmon","seaGreen","skyBlue","springGreen","wheat","paleGreen","navy","olive","paleVioletRed","yellow","peru"];
        }else{
            chart.personalColors = cortar; // return array whitout the first element
        }
        
        //this.graph.fillAlphas = 0.7;
        this.graph.negativeLineColor = "red"; // "#b5030d" //
        //graph1.balloonText = "<img src='http://www.amcharts.com/lib/3/images/car.png' style='vertical-align:bottom; margin-right: 10px; width:28px; height:21px;'><span style='font-size:14px; color:#000000;'><b>[[value]]</b></span>";
        this.graph.balloonText = "[[title]]: [[value]]"; // "[[title]] of [[category]]:[[value]]"; //
        this.graph.hidden = false;
        //this.graph1.lineAlpha = 0.8;

        

            // SCROLLBAR
            var chartScrollbar = new AmCharts.ChartScrollbar();
            chartScrollbar.graph = this.graph;
            chartScrollbar.color = "#FFFFFF";
            chartScrollbar.autoGridCount = true;
            chartScrollbar.scrollbarHeight = 40;
            //chartScrollbar.maximum = 20;
            chart.addChartScrollbar(chartScrollbar);
    }

    function createChart(){
        // SERIAL CHART    
        chart = new AmCharts.AmSerialChart();
        chart.pathToImages = "http://www.amcharts.com/lib/images/";
        chart.marginTop = 10;
        chart.marginRight = 20;
        chart.dataProvider = chartData;
        chart.categoryField = "date";
        chart.theme = "default";
        chart.autoMarginOffset = 5;
        chart.zoomOutButton = {
            backgroundColor: '#000000',
            backgroundAlpha: 0.15
        };
        chart.titles = [
            {
                //"id": "Title-1",
                "size": 15,
                "text": 'Rangue of connexions'
            }
        ];

        // LEGEND => leyenda superior cuando pones el ratón encima
        var legend = new AmCharts.AmLegend();
        legend.equalWidths = false;
        legend.periodValueText = "total: [[value.sum]]";
        legend.position = "bottom";
        legend.valueAlign = "left";
        legend.valueWidth = 100;
        chart.addLegend(legend);

        // AXES => X
        // category
        var categoryAxis = chart.categoryAxis;
        // como nuestros datos están basado en la fecha... establecemos "parseDates" a TRUE
        categoryAxis.parseDates = true;
        // etablecemos el periodo de nuestros datos...
        // fff->mlsc, ss->sc, mm->minute, hh->hour, DD->day, MM->month, YYYY->year
        categoryAxis.minPeriod = "fff"; // our data is daily, so we set minPeriod to DD
        // categoryAxis.dashLength = 1;
        // categoryAxis.gridAlpha = 0.15;
        categoryAxis.axisColor = "#DADADA";// grey
        categoryAxis.title = "Time analyzed";

        // value => Y             
        var valueAxis = new AmCharts.ValueAxis();
        valueAxis.axisAlpha = 0.2;
        valueAxis.dashLength = 1;
        valueAxis.position = "left";
        valueAxis.title = "Number conexions";
        chart.addValueAxis(valueAxis);

        // CURSOR
        var chartCursor = new AmCharts.ChartCursor();
        chartCursor.cursorPosition = "mouse";
        chart.addChartCursor(chartCursor);

        // WRITE in the div DOM element with id="chartdiv"
        chart.write("chartdiv");
    }


    /* ANTIGUO
    // varaibles para generar registros
    var username = 'Servidor01';
    var ESTABLISHED = 0;
    var LISTEN = 0;
    var mini =  0;
    var date = 1438700357386;
    // genero registros cada 5 segundos
    var time = (25*60*60*1000)/5000;
    var gancho = 0;
    
    //cuando el DOM esté cargado haz...
    $(document).ready(function(){

        genGrafica();

    }); // final $READY 
    
    function generarReg(){

        if (gancho < time){

            ESTABLISHED = Math.round(Math.random()*100);
            LISTEN = Math.round(Math.random()*100);
            mini =  Math.round(Math.random()*100);
            date = date - 5000;
            //alert(username+"/"+ESTABLISHED+"/"+LISTEN+"/"+mini+"/"+hour);
            create(username,ESTABLISHED,LISTEN,mini,date);

            gancho = gancho + 1;
        } // final IF
    }

    function create(username,ESTABLISHED,LISTEN,mini,date){
        // no me deja utilizar DATE en los HEADERS, en su defecto pongo 'hour'
        $.ajax({
            url:"/api",
            type: 'POST',
            timeout: 12000,
            dataType: 'json',
            headers: {
                    username : username,
                    ESTABLISHED: ESTABLISHED,
                    LISTEN: LISTEN,
                    mini: mini,
                    hour:date
                },
            data: {"pruebaPOST":"valor de prueva"},
            success:function(datos,status){
                generarReg();
                // en caso de error...
                if(status !=="success"){
                    generarReg();
                    console.log(status);
                }
            },
            error:function(xhr){
                console.log("Un error ha ocurrido: " + xhr.status + " -> " + xhr.statusText);
                // 404 no found
            },
            complete:function(){
                //reciveAll();
            }
        }); // FINAL $.AJAX
    }

    function DELETE (){
        $.ajax({
            url:"/api",
            type: 'DELETE',
            timeout: 12000,
            dataType: 'json',
            headers: {
                    _id : '55bf28282551714415000005'
                },
            data: {"prueba":"valor de prueva"},
            success:function(datos,status){
                console.log("registro BORRADO en MONGO: "+JSON.stringify(datos));
                // en caso de error...
                if(status !=="success"){
                    console.log(status);
                }
            },
            error:function(xhr){
                console.log("Un error ha ocurrido: " + xhr.status + " -> " + xhr.statusText);
                // 404 no found
            },
            complete:function(){
                //reciveAll();
            }
        }); // FINAL $.AJAX 

    }

    function modify(){
        $.ajax({
            url:"/api",
            type: 'PUT',
            timeout: 12000,
            dataType: 'json',
            headers: {
                    _id : '55bf29460f98ef9816000003',
                    username : 'Servidor69',
                    ESTABLISHED: 69
                },
            success:function(datos,status){
                // en caso de error...
                if(status !=="success"){
                    console.log(status);
                }
            },
            error:function(xhr){
                console.log("Un error ha ocurrido: " + xhr.status + " -> " + xhr.statusText);
                // 404 no found
            },
            complete:function(){
                // reciveAll();
            }
        }); // FINAL $.AJAX 

    }

	function reciveAll(){
		$.ajax({
            url:"/api",
            type: 'GET',
            timeout: 12000,
            dataType: 'json',
            success:function(datos,status){
                // inserto en el div
				$('.ajax').html('<p>'+JSON.stringify(datos)+'</p>');
				// en caso de error...
                if(status !=="success"){
					console.log(status);
                }
            },
            error:function(xhr){
                console.log("Un error ha ocurrido: " + xhr.status + " -> " + xhr.statusText);
                // 404 no found
            },
            complete:function(){
                //reciveAll();
            }
        }); // FINAL $.AJAX
	} */

}]); // FINAL MODULE
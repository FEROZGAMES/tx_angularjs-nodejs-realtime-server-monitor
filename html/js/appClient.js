'use strict';

var miApp = angular.module('resumen', ['ui.router','oc.lazyLoad']);
  
miApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false
    });

    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('inicio', {
        url: "/", // ruta raiz
        views: {
          "viewPrincipal": { // index.html=> <div ui-view="lazyLoadView">
            controller: 'chatNode', // Esta vista usará AppCtrl (la ruta del JS que se cargará se indica en el 'resolve' de más abajo)
            templateUrl: '/views/00-chatNode.html' // vista a cargar
                          //'/views/00-chatNodeWORKING.html' 
          }
        },
        resolve: { // configuración de Nacho
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([{
                      serie:true,
                      name: 'resumen', // nombre de la aplicación
                      files: [
                          'https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.3.5/socket.io.min.js',
                          'http://www.amcharts.com/lib/amcharts.js',
                          '/controller/00-chatNode.js'
                          //'/controller/00-chatNodeWORKING.js'
                      ]
                  }]);
              }]
          }
      })
      .state('filtrar', {
        url: "/filtrar", // ruta raiz
        views: {
          "viewPrincipal": { // index.html=> <div ui-view="lazyLoadView">
            controller: 'filtrar', // Esta vista usará AppCtrl (la ruta del JS que se cargará se indica en el 'resolve' de más abajo)
            templateUrl: '/views/01-filtrar.html' // vista a cargar
          }
        },
        resolve: { // configuración de Nacho
              deps: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([{
                      serie:true,
                      name: 'resumen', // nombre de la aplicación
                      files: [
                          '//ajax.googleapis.com/ajax/libs/angularjs/1.4.5/angular-animate.js',
                          //'//angular-ui.github.io/bootstrap/ui-bootstrap-tpls-0.13.4.js',
                          '/js/ui-bootstrap-tpls-0.13.4.js',
                          'https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.3.5/socket.io.min.js',
                          'http://www.amcharts.com/lib/amcharts.js',
                          '/controller/01-filtrar.js'
                           
                      ]
                  }]);
              }]
          }
      });
});
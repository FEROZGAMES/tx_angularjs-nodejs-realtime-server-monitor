<?php
// para hacerlo correr abrir consola y ejecutar: php client.php

//$datoEnviar = "Prueba de dato";
$serverName= 'Servidor01';
// elephant.io recoge las variables SIN PROBLEMAS
// ya sea una cadena, un objeto / hash / o un array asociativo
// $objeto= array('room' => 'Pedro','mensaje' => $username);

use ElephantIO\Client,
    ElephantIO\Engine\SocketIO\Version1X;

require __DIR__ . '/vendor/autoload.php';

//$client = new Client(new Version1X('http://localhost:65500'));
$client = new Client(new Version1X('http://192.168.1.201:64500'));

$client->initialize();

// para enviar una CADENA/STRING
// $client->emit('addRoom', [$username]);
// para enviar un array asociativo 01
$client->emit('envioPHP', ['serverName' => $serverName, 'ESTABLISHED' => 30, 'LISTEN' => 40, 'pepe' => 50]);
// para enviar un array asociativo 02
// $client->emit('messageSend', $objeto);

// cerramos la conexión
$client->close();

/*
// otra manera de emitir un mensaje
$elephant->send(
	ElephantIOClient::TYPE_MESSAGE,
	null,
	null,
	'Hello World!');
*/
/*
// para mantener la conexión persistente pero en la documentacion no lo aconseja
$elephant->keepAlive();
*/
?>
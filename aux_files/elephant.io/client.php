<?php

$serverName= 'Servidor01';

use ElephantIO\Client,
    ElephantIO\Engine\SocketIO\Version1X;
require __DIR__ . '/vendor/autoload.php';


$client = new Client(new Version1X('http://101.101.101.101:64500'));
$client->initialize();


$client->emit('envioPHP', ['serverName' => $serverName, 'var1' => 30, 'var2' => 40, 'var3' => 50]);


// cerramos la conexión
$client->close();
?>
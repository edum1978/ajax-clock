<?php 
header('Content-Type: text/xml');
sleep(3);

$segundos = time();
//suma un día, un minuto  y un segundo adelantado
//$segundos = time() + 86461;

echo "<?xml version=\"1.0\"?><clock1><hora>". $segundos ."</hora></clock1>";
//SE retrasa de la hora real lo quie tarde en llegar la respuesta desde el servidor al cliente//
//sleep(4);
?>






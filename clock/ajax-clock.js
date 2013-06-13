//**************************************************************//
//******Reloj sincronizado con el servidor mediante AJAX********//
//**************************************************************//
//***Creado por Eduardo Mazarrasa Ocón en Diciembre 2012********//
//*********Creative Commons Reconocimiento 3.0******************//
//***********www.eduardo.mazarrasa.tk/ajax-clock/***************//
//**************************************************************//
//******Optimizado para IE 9, Chrome 23, firefox 15 ************//
//**************************************************************//

/******************VARIABLES CONFIGURABLES****************************************************
//var maxConexiones = tiempo(milisegundos) = maxConexiones * intervaloActualizacion 
EJ: intervaloActualizacion = 600000 y maxConexiones = 60 --> tiempo de autosincronización maximo = 1 hora
*/
var intervaloActualizacion = 60000; //Establece el intervalo en milisegundos en el que se conecta al servidor.
var maxConexiones = 5; //Establece el tiempo maximo de conexiones automaticas al servidor, para conexiones ilimitadas poner a false.

/************VARIABLES GLOBALES******************************************************
//
*/
var horaServer = new Date(); //adopta en primer momento la hora del cliente y que se actualiza con cada llamada a la función compruebaHoraServidor()

var segProximaSin = 0; //indica segundos restantes para próxima actulización con el servidor.

//variables para numero maximo de peticiones de sincronizacion al servidor.
var contadorConexiones =  1;	
var servidor;
var finSincro;
var proxSincro;
var moverReloj;
var mantenerHora;

/**************************getXMLHttpRequest*******************************************************
/*Establece el tipo de llamda ajax en funcion del navegador
*/
var http = getXMLHttpRequest();
function getXMLHttpRequest(){
			
  var req = false;
  try
	{
		req = new XMLHttpRequest(); /*IE7+, Firefox, Chrome, Opera, Safari*/
	}
  catch(err1)
  {
    try
		{
			req = new ActiveXObject("Msxml2.XMLHttp");/*explorer muy antiguos*/
		}
    catch(err2) 
		{ 
		try
			{
				req = new ActiveXObject("Microsoft.XMLHttp");/*explorer*/
			}
		catch(err3) 
		{ 
			req = false
		}
	}
  }
  return req;
}
/*******************compruebaHoraServidor**************************************************
//comprueba que el navegador está listo para hacer solicitud ajax y configura la peticion.
*/
function compruebaHoraServidor(){
	//nombre del archivo que devuelve la hora del servidor
	var myurl = 'datexml.php';
	//Evita el cacheo de la petición//
	var miAleatorio = parseInt(Math.random()*99999999);
	var modurl =  myurl +"?rand="+miAleatorio;
	http.open("GET",modurl,true);
	http.onreadystatechange = recargaDatos;
	http.send(null);
	/*Restablece segProximaSin (segundos para próxima sincronización)*/
	segProximaSin = (intervaloActualizacion /1000);
}
/**************recargaDatos*************************************************************
//llamada por AJAX al servidor para establecer la variable horaserver
*/
function recargaDatos()
	{
		if(http.readyState ==4)
			{
			if (http.status == 200)
				{
				
				/*Respuesta del servior correcta*/
				/*Recoge el valor en segundos del archivo xml*/
				var segundos = http.responseXML.getElementsByTagName("hora")[0].childNodes[0].nodeValue
				//milisegundos desde 1970(Época Unix)
				horaServer.setTime(Number(segundos)*1000);
				
				//muestra la fecha de ultima sincronización con el servidor
				document.getElementById('servidor').innerHTML = "</p><p>&Uacute;ltima sincronizaci&oacute;n con el servidor: "+ horaServer + "</p>";
				
				}
			else
				{
				//mensaje de error
				document.getElementById('servidor').innerHTML = '<p><img  src="img/error.jpg"> No se encuentra el servidor</p>';
				}
			}
		else
			{
				document.getElementById('servidor').innerHTML = '<p>Waiting server...<img src="img/wait.gif"></p><p>';
			}
	}

/********************función de inicio**************************************
//Dispara compruebaHoraServidor()
//mantiene activos los procesos de actualizacion con el servidor segun intervaloActualizacion y
// movimiento de agujas mueveReloj() y proximaSincro() cada segundo.
//ejecuta mantenerHoraClienteServidor(incremento) para contrarrestar retardo entre servidor y cliente.
*/
function initTimer(){
		compruebaHoraServidor();
		//incrementada en 2 seg. la hora recibida del servidor para evitar el retraso entre servidor y cliente @TODO calcular tiempo de retardo entre cliente y servidor.
		mantenerHoraClienteServidor(2000);
		//*Extablece el intervalo en milisegundos en el que se conecta al servidor para actualizar la hora cliente-servidor.****/
		servidor = setInterval(function(){compruebaHoraServidor();}, intervaloActualizacion);
		
		//si hay limite de conexiones establecido 
		if(maxConexiones){
			finSincro = setInterval(function(){finSincronizacion();}, intervaloActualizacion);
		}
		//
		proxSincro = setInterval(function(){proximaSincro(segProximaSin - 1);}, 1000);
        moverReloj = setInterval(function(){mueveReloj();}, 1000);
		//incrementada cada segundo en 1 seg. la hora recibida del servidor.
		mantenerHora = setInterval(function(){mantenerHoraClienteServidor(1000);}, 1000);
				
   }
/**********mantenerHoraClienteServidor*******************************
//mantener valor recibio desde el servior actualizada artificilamente
//incremntando en un segundo cada segundo
*/	
function mantenerHoraClienteServidor(incremento){
	horaServer.setTime(horaServer.getTime()+ incremento);

}
/*****************mueveReloj**********************************************************
//Recoloca las agujas del reloj los grados corresponientes en funcion de
//la hora cliente-servidor y actuliza el reloj digital en funcion de la hora cliente
//tambien se encarga de incremetar la hora cliente-servior en un segundo.
*/
function mueveReloj(){
	//mostrar la hora del cliente	
	var cliente = new Date();
	var horacliente = cliente.getHours();
	var minutocliente = cliente.getMinutes();
	var segundocliente = cliente.getSeconds();
	//document.getElementById('relojcliente').innerText = "Hora Cliente: "+ imprimeHora(horacliente,minutocliente,segundocliente);
	document.getElementById('relojcliente').innerHTML = "<p>Hora Cliente: "+ imprimeHora(horacliente,minutocliente,segundocliente)+ "</p>";
		
	//mostrar la hora calculada apartir de los datos de la hora del servidor
	var horaScliente = horaServer.getHours();
	var minutoScliente = horaServer.getMinutes();
	var segundoScliente = horaServer.getSeconds();
	//var milisegundo = horaServer.getMilliseconds();
	document.getElementById('relojservidorcliente').innerHTML = "<p title='Partiendo del dato de la hora el servidor se continua el calculo en el cliente.'>Hora Servidor-Cliente: "+ imprimeHora(horaScliente,minutoScliente,segundoScliente)+ "</p>";
	
	//calcula el angulo de desplazamineto de cada aguja del reloj
	//var posSeg = "rotate("+(90 +( milisegundo*100 * 6 ))+"deg)";
	var posSeg = "rotate("+(90 +( segundoScliente * 6 ))+"deg)";
	var posMin = "rotate("+(90 +( minutoScliente * 6 ))+"deg)";
	var posHor = "rotate("+(90 +( horaScliente * 30 ))+"deg)";
		
	//Rotar agujas para IE9, Firefox15 y Chrome23//
	//document.getElementById('segundos').style.transform = "rotate(0deg)";
	document.getElementById('segundero').style.msTransform = posSeg;
	document.getElementById('minutero').style.msTransform = posMin;
	document.getElementById('horero').style.msTransform = posHor;
	
	document.getElementById('segundero').style.MozTransform = posSeg;
	document.getElementById('minutero').style.MozTransform = posMin;
	document.getElementById('horero').style.MozTransform = posHor;
	
	document.getElementById('segundero').style.webkitTransform = posSeg;
	document.getElementById('minutero').style.webkitTransform = posMin;
	document.getElementById('horero').style.webkitTransform = posHor;
		
}
 
/*******************proximaSincro***********************************************
//Informa de cuanto falta para la proxima sincronizacion con el servidor
*/
function proximaSincro(valor){
	document.getElementById('sincroya').innerHTML = "<button onclick='compruebaHoraServidor();'>Sincronizar ahora ("+ valor +")</button>";
	segProximaSin = segProximaSin - 1;
}

/****************imprimeHora****************************
//Devuelve horas minutos y segundos concatenados 
//	14,15,6  ->  14:15:06
*/
function imprimeHora(horas,minutos,segundos){
	var imprimible = dosDigitos(horas) + " : " + dosDigitos(minutos) + " : " + dosDigitos(segundos);
	return imprimible;
}

/************dosDigitos********************************
//Transforma valores de un digito a dos digitos
*/
function dosDigitos(i){
	if (i<10) 
	  {
	  i="0" + i;
	  }
	return i;
}

/************finSincronizacion*********************************
//finaliza la sincronización con el servidor.
*/
function finSincronizacion(){
	contadorConexiones += 1;
	if (contadorConexiones >= maxConexiones){
		clearInterval(servidor);
		clearInterval(finSincro);
		clearInterval(proxSincro);
		proximaSincro("parado");
		document.getElementById('sincroya').innerHTML = "<button onclick='reinicioSincronizacion();'>Sincronizar ahora</button>";
	}
}
/************reinicioSincronizacion**************************************************
//resetea el contador de conexiones para el movimiento de los relojes
//y reinicia el reloj y la sincronizacion ejecutando la función de inicio initTimer()
*/
function reinicioSincronizacion(){
	contadorConexiones =  1;
	clearInterval(moverReloj);
	clearInterval(mantenerHora);
	initTimer();
}

<?php
session_start();

if ((!isset($_SESSION['usfsd']) ||  !isset($_SESSION['pssfsd']) || $_SESSION['proyecto'] != 'tablillas')) {
  header('location:./entrando.php');
}
?>
<!DOCTYPE html>
<html lang="es" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>Textos sumerios</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script defer src="https://use.fontawesome.com/releases/v5.0.9/js/all.js" integrity="sha384-8iPTk2s/jMVj81dnzb/iFR2sdA7u06vHJyyLlAd4snFpCl/SnyUjRrbdJsw1pGIl" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="http://usig-proyectos.cchs.csic.es/ol/v5.3.0-dist/ol.css" type="text/css">
    <!--  Polyfill es necesario para que OL funcione con IE: -->
    <script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=requestAnimationFrame,Element.prototype.classList"></script>
    <script src="http://usig-proyectos.cchs.csic.es/ol/v5.3.0-dist/ol.js" type="text/javascript"></script>
    <script src="https://d3js.org/d3.v4.min.js"></script>
    <link rel="stylesheet" href="./css/master.css">
    <script type="text/javascript" src="./js/visor.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/css/select2.min.css" rel="stylesheet" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/select2-bootstrap-theme/0.1.0-beta.10/select2-bootstrap.css" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.6-rc.0/js/select2.full.min.js"></script>
    <script src="./js/arc.js-gh-pages/arc.js"></script>
  </head>
  <body onload="javascript:InitMapa();CargaYacis(PonYacis);CargaMuseos(PonMuseos);PonPopups();javascript:PonLeyenda();">
      <nav class="navbar navbar-dark bg-dark fixed-top cabecera" >
        <div class="">
          <span id="titulo" class="navbar-text">Neo-Summerian Texts Web Map</span>
        </div>
        <div class="well  col-md-6" style="padding:0;margin:0;">
          <p style="margin:0;color:#6E6E6E;font-weight:bold;">Beta version web portal
            <button type="button" class="btn btn-danger btn-md" onclick="window.location.href='./datos/desconecta.php'" style="margin-left: 20px;">Log out
              <span class="glyphicon glyphicon-log-out" aria-hidden="true"></span>
            </button>
          </p>
        </div>
        <div class="" style="width:200px;">
          <a href="http://bdtns.filol.csic.es/" target="_blank"><img src="./img/logo_BDTNS.gif" title="BDTNS" class="" style="width:50px;height:50px"/></a>
        </div>
      </nav>
      <div class="container-fluid todo">
        <div id="map" class="map" style="position:absolute">
          <div id="popup"></div>
        </div>
        <div class="bloque-izq">
          <div id="leyenda" class="leyenda" >
          </div>
          <div class="">
            <div class="form-group">
              <select class="form-control" name="b-yaci" id="busca-yaci" >
                <option value=""></option>
              </select>
            </div>
          </div>
        </div>
        <div class="info-pos">
          <span id="escala-graf" class="">
          </span>
          <span id="coord" class="coord">
          </span>
        </div>
        <div class="" title="Change basemap">
          <div id="basemapbox" class="mapa-base base-mapbox" style="display: none" onclick="javascript:ponMapaBase('teselas');"></div>
          <div id="baseesri" class="mapa-base base-esri" onclick="javascript:ponMapaBase('esrifoto');"></div>
        </div>
      </div>
      <footer class="footer">
        <span>
          <img src="./img/cc-by-sa.png" title="copyright" class="logo"/ style="margin-right: 5em;"> 	© 2002 Manuel Molina. </span>
          <span class="credits"><a href="http://bdtns.filol.csic.es/extras/doc/2011_12_20_Copyright_BDTNS.pdf" target="_blank">Copyright and credits.</a> Funded by Ministerio de Ciencia, Innovación y Universidades</span>
        <span style="float:right">
          <a href="http://www.csic.es/" target="_blank"><img src="./img/logo_csic.png" title="CCHS" class="logo"/></a>
          <a href="http://cchs.csic.es/" target="_blank"><img src="./img/cchs_b.png" title="CCHS" class="logo"/></a>
          <a href="http://unidadsig.cchs.csic.es/sig/" target="_blank"><img src="./img/usig_b.png" class="logo" title="USIG"/></a>
        </span>
    </footer>
  </body>
</html>

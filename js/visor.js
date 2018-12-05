
//var urlMapbox ='https://api.mapbox.com/styles/v1/nuriet/cjin3sb4l08ch2spe4oetgy15/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibnVyaWV0IiwiYSI6ImNqOG9tNXA5ZTA0dDkzMnF1N3BrdXNoNWsifQ.lrE5q9kdpMCeMdrkn47Xeg';//NURIA

//var urlMapbox = 'https://api.mapbox.com/styles/v1/cffreire/cjipt367l3d4e2rntko780auz/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2ZmcmVpcmUiLCJhIjoiY2lybHpnZWZvMDAzb2hwbTE0bWpuc2txNCJ9.K55gd-Kc619sLEZno6XkNQ';//CARLOS

var urlMapbox = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY2ZmcmVpcmUiLCJhIjoiY2lybHpnZWZvMDAzb2hwbTE0bWpuc2txNCJ9.K55gd-Kc619sLEZno6XkNQ';//publica

function IsCluster(feature) {
  if (!feature || !feature.get('features')) {
        return false;
  }
  return feature.get('features').length > 1;
}

function mode(array)
{
    if(array.length == 0)
        return null;
    var modeMap = {};
    var maxEl = array[0], maxCount = 1;
    for(var i = 0; i < array.length; i++)
    {
        var el = array[i];
        if(modeMap[el] == null)
            modeMap[el] = 1;
        else
            modeMap[el]++;
        if(modeMap[el] > maxCount)
        {
            maxEl = el;
            maxCount = modeMap[el];
        }
    }
    return maxEl;
}

function CargaYacis(callback){
  $.ajax({
    url: './datos/cargaYacis.php',
    success: function(response){
  			if (response) {
  				callback(response);
  			}
  			else{
  				alert('Error cargando los centros');
  			}
  		}
  });
}

function CargaMuseos(callback){
  $.ajax({
    url: './datos/cargaMuseos.php',
    success: function(response){
  			if (response) {
  				callback(response);
  			}
  			else{
  				alert('Error cargando los centros');
  			}
  		}
  });
}

function SelecTablillasYaci(yaci,callback){
  $.ajax({
    url: './datos/tablillasPorYaci.php',
    data: {
      yaci: yaci
    },
    success: function(response){
  			if (response) {
          response.origen = yaci
  				callback(response);
  			}
  			else{
  				alert('Error cargando tablillas');
  			}
  		}
  });
}

function PonTablillasYaci(resultado){
  var yacis;
  var museos;
  var origen;
  var idDestinos = [];
  var destinos = [];
  var destinoTablillas;
  var destinosSource = new ol.source.Vector();
  for (var i = 0; i < resultado.length; i++) {
    idDestinos.push(resultado[i].idmuseo);
  }
  var capas = mapa.getLayers().getArray();
  for (var i = 0; i < capas.length; i++) {
    var nomcapa = capas[i].get('name');
    if (nomcapa == 'yacis') {yacis = capas[i];}
    if (nomcapa == 'museos') {museos = capas[i];}
    if (nomcapa == 'destino-tablillas') {destinoTablillas = capas[i];}
    }
  yacis.getSource().forEachFeature(
    function(f){
      if (f.get('id') == resultado.origen) {
        origen = f;
      }
    }
  )
  museos.getSource().forEachFeature(
    function(f){
      if (idDestinos.indexOf(f.get('id')) != -1) {
        destinos.push(f);
      }
      else{
      }
    }
  )
  for (var i = 0; i < destinos.length; i++) {
    var lineaPuntFeat = new ol.Feature();
    var destino = $.grep(resultado,function(d){return d.idmuseo == destinos[i].get('id')})[0];
    // linea.appendCoordinate(origen.getGeometry().getCoordinates());
    // linea.appendCoordinate(destinos[i].getGeometry().getCoordinates());
    var inicio = {x:0,y:0};
    var fin = {x:0,y:0};
    var origenGeo = origen.getGeometry().transform('EPSG:3857','EPSG:4326').clone();
    var destinoGeo = destinos[i].getGeometry().transform('EPSG:3857','EPSG:4326').clone();
    origen.getGeometry().transform('EPSG:4326','EPSG:3857');
    destinos[i].getGeometry().transform('EPSG:4326','EPSG:3857');
    inicio.x = origenGeo.getCoordinates()[0];
    inicio.y = origenGeo.getCoordinates()[1];
    fin.x = destinoGeo.getCoordinates()[0];
    fin.y = destinoGeo.getCoordinates()[1];
    var arco = new arc.GreatCircle(inicio, fin);
    var coordLinea = arco.Arc(200,{offset:10});
    var linea = new ol.geom.LineString(coordLinea.geometries[0].coords);
      linea.transform('EPSG:4326','EPSG:3857');
    var geomDestino = new ol.geom.GeometryCollection([linea,destinos[i].getGeometry()]);
    lineaPuntFeat.setGeometry(geomDestino);
      lineaPuntFeat.set("imagen",destinos[i].get('imagen'));
      lineaPuntFeat.set("mostrar_tipo",destinos[i].get('mostrar_tipo'));
      lineaPuntFeat.set("destino",destinos[i].get('nombre'));
      lineaPuntFeat.set("mostrar_origen",origen.get('nombre'));
      lineaPuntFeat.set("mostrar_numero_de_tablillas",Number(destino.count));
      lineaPuntFeat.set("id",destino.id);
    destinosSource.addFeatures([lineaPuntFeat]);
  }
  destinoTablillas.setSource(destinosSource);//para hacer curvas hay que usar arcs.js: https://github.com/springmeyer/arc.js
  CierraPops();
  mapa.getView().fit(destinosSource.getExtent(),{duration:1000});
}

function PonYacis(resultado){
  var yacis;
  var capas = mapa.getLayers().getArray();
  for (var i = 0; i < capas.length; i++) {
    var nomcapa = capas[i].get('name');
    if (nomcapa == 'yacis') {yacis = capas[i];}
    }
  var geojsonYacis = new ol.format.GeoJSON().readFeatures(resultado);
  var yacisSource = new ol.source.Vector({
        features: geojsonYacis
      });
  yacis.setSource(yacisSource);
  mapa.getView().fit(yacis.getSource().getExtent(), {duration: 2000});
}

function PonMuseos(resultado){
  var museos;
  var capas = mapa.getLayers().getArray();
  for (var i = 0; i < capas.length; i++) {
    var nomcapa = capas[i].get('name');
    if (nomcapa == 'museos') {museos = capas[i];}
    }
  var geojsonMuseos = new ol.format.GeoJSON().readFeatures(resultado);
  var museosSource = new ol.source.Vector({
        features: geojsonMuseos
      });
  museos.setSource(museosSource);
}

function EstiloYacis(feature) {
    var radio = 8;
    var circulo = new ol.style.Circle({
      radius: radio,
      stroke: new ol.style.Stroke({
        width: 2,
        color: '#CCC'
      }),
      fill: new ol.style.Fill({
        color: '#CC503E'
      }),
      rotateWithView: true
    });
    var estilo_yaci = new ol.style.Style({
      image: circulo
    });
    return [estilo_yaci];
}

function EstiloMuseos(feature) {
    var estilo_mus = new ol.style.Style(null);
    return [estilo_mus];
}

var rampa1 = [
  {"hex":'#5F4690',"rgb":'95,70,144'},
  {"hex":'#1D6996',"rgb":'29,105,150'},
  {"hex":'#38A6A5',"rgb":'56,166,165'},
  {"hex":'#0F8554',"rgb":'15,133,84'},
  {"hex":'#73AF48',"rgb":'115,175,72'},
  {"hex":'#EDAD08',"rgb":'237,173,8'},
  {"hex":'#E17C05',"rgb":'225,124,5'},
  {"hex":'#CC503E',"rgb":'204,80,62'},
  {"hex":'#94346E',"rgb":'148,52,110'},
  {"hex":'#6F4070',"rgb":'111,64,112'},
  {"hex":'#994E95',"rgb":'153,78,149'},
  {"hex":'#666666',"rgb":'102,102,102'}
];

var objTipDest = [
  {texto:'University',color: rampa1[6]},
  {texto:'Library',color:rampa1[7]},
  {texto:'Private collection',color:rampa1[2]},
  {texto:'Museum',color:rampa1[8]},
  {texto:'Ecclesiastic',color:rampa1[5]}
];

function ColorDestino(txttipdest){
  var objArea = $.grep(objTipDest,function(tipdest){return tipdest.texto == txttipdest});
  return objArea[0].color;
}

function EstiloDestinosTab(feature) {
  var estilos = [];
  var lineWidthScale = d3.scaleLinear().range([1, 5]);
  var relleno = ColorDestino(feature.get('mostrar_tipo')).hex;
  var geoms = feature.getGeometry().getGeometries();
  var linea = geoms[0];
  var punto = geoms[1];
  var estiloPunto = new ol.style.Style({
       geometry: punto,
       image: new ol.style.Circle({
             radius: ((lineWidthScale(Math.log(feature.get('mostrar_numero_de_tablillas'))) - lineWidthScale.range()[0])/2)+3,
             stroke: new ol.style.Stroke({
               width: 2,
               color: 'rgba('+rampa1[11].rgb +',0.5)',
             }),
             fill: new ol.style.Fill({
               color: relleno
             }),
             rotateWithView: true
           })
   });
   estilos.push(estiloPunto);
   var i = 0;
   var strokeWidthIncrement = (lineWidthScale(Math.log(feature.get('mostrar_numero_de_tablillas'))) - lineWidthScale.range()[0]) / (linea.getCoordinates().length - 1);
   var opacityIncrement = 0.8 / (linea.getCoordinates().length - 1);
   linea.forEachSegment(function (start, end) {
     estilos.push(new ol.style.Style({
       geometry: new ol.geom.LineString([start, end]),
       stroke: new ol.style.Stroke({
         lineCap : (i==0)? 'round' : 'butt',
         lineJoin : 'miter',
         color: 'rgba('+ColorDestino(feature.get('mostrar_tipo')).rgb +','+ ((opacityIncrement * i)) + ')',
         width: lineWidthScale(lineWidthScale.range()[0]) + (strokeWidthIncrement * i)
       })
     }));
     i++;
   });
    return estilos;
}

function InitMapa(){
  var mapbox = new ol.layer.Tile({
        source: new ol.source.XYZ({
          attributions: ' Basemap by <a href="https://www.mapbox.com/about/maps/">© Mapbox</a> | <a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> | <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>',
          url: urlMapbox
        })
      });
    var yacis = new ol.layer.Vector({
            style: EstiloYacis
          });
      yacis.set('name', 'yacis');
    var museos = new ol.layer.Vector({
            style: EstiloMuseos
          });
      museos.set('name', 'museos');
    var destinoTablillas = new ol.layer.Vector({
            renderMode: 'image',
            style: EstiloDestinosTab
          });
      destinoTablillas.set('name', 'destino-tablillas');
    mapa = new ol.Map({
      controls: [
        new ol.control.Zoom({
          className: 'zoom-centros'
        }),
        new ol.control.ScaleLine({
          target: 'escala-graf',
        }),
        new ol.control.MousePosition({
          coordinateFormat: function(coord){ return ol.coordinate.format(coord, '{x}, {y}', 4)+' (lon, lat) WGS84';},
          //coordinateFormat: function(coord){ return ol.coordinate.toStringHDMS(coord)+' (lat, lon) WGS84';},
          projection: 'EPSG:4326',
          className: 'custom-mouse-position',
          target: document.getElementById('coord'),
          undefinedHTML: '&nbsp;'
        }),
        new ol.control.Attribution()
      ],
      layers: [mapbox,destinoTablillas,yacis, museos],
      view: new ol.View({
        projection: 'EPSG:3857',
        center: [-288976.121475105, 4868797.98060151],
        minZoom: 2,
        maxZoom:18,
        zoom: 3
      }),
      target: 'map'
    });
    mapa.on('postrender', function(e) {
         let popover = $('#popup').data('bs.popover');
         if(!popover) return;
         let popper = popover._popper;
         if(!popper) return;
       popper.scheduleUpdate();
     });
}

function ponMapaBase(capa){
	if (capa == 'mapbox') {
		var mapbox = new ol.layer.Tile({
	      source: new ol.source.XYZ({
	      	attributions: ['Basemap by <a href="https://www.mapbox.com/about/maps/">© Mapbox</a> | <a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> | <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>'],
	        url: 'https://api.mapbox.com/styles/v1/nuriet/cjin3sb4l08ch2spe4oetgy15/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibnVyaWV0IiwiYSI6ImNqOG9tNXA5ZTA0dDkzMnF1N3BrdXNoNWsifQ.lrE5q9kdpMCeMdrkn47Xeg'
	      })
	    });
	    mapbox.set('name','mapabase');
	    mapa.getLayers().removeAt(0);
	    mapa.getLayers().insertAt(0,mapbox);
	   // document.getElementById('creditos-base').innerHTML = mapbox.getSource().attributions_[0].html_;
	    $('#basemapbox').hide();
	    $('#baseesri').show();
    }
    else if (capa == 'esrifoto') {
    	var baseEsri =  new ol.layer.Tile({
		    source: new ol.source.XYZ({
		      attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
		          'rest/services/World_Imagery/MapServer">ArcGIS</a> | Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
		      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/' +
		          'World_Imagery/MapServer/tile/{z}/{y}/{x}'
		    })
		  });
		baseEsri.set('name','mapabase');
		baseEsri.setOpacity(0.8);
		mapa.getLayers().removeAt(0);
		mapa.getLayers().insertAt(0,baseEsri);
    //console.log(baseEsri.getSource().getKeys());
	    //document.getElementById('creditos-base').innerHTML = baseEsri.getSource().attributions_[0].html_;
	    $('#baseesri').hide();
	    $('#basemapbox').show();
    }
}

function PonPopups(){
  var popup = new ol.Overlay({
      element: document.getElementById('popup'),
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
  });
  mapa.addOverlay(popup);
  mapa.on('click', function(evt) {
    var feats = mapa.getFeaturesAtPixel(evt.pixel);
    if (feats) {
      mapa.forEachFeatureAtPixel(evt.pixel,function(feature,layer){
        DisparaPopup(evt,feature,layer);
      });
    }
    else{
      LimpiaMapa();
    }
  });
}

function LimpiaMapa(){
  CierraPops();
  var destinoTablillas,museos;
  var capas = mapa.getLayers().getArray();
  for (var i = 0; i < capas.length; i++) {
    var nomcapa = capas[i].get('name');
    if (nomcapa == 'museos') {museos = capas[i];}
    if (nomcapa == 'destino-tablillas') {destinoTablillas = capas[i];}
    }
  museos.getSource().forEachFeature(
    function(f){
      f.setStyle(EstiloMuseos);

    }
  )
  destinoTablillas.setSource();
}

function IrACentro(){
  var centro = $("#busca-centro").select2('data')[0];
  mapa.getView().fit(centro.getGeometry(), {duration: 1000});
}

function DisparaPopup(evt,feature,layer){
  if (layer.get('name') == 'yacis') {
    if (feature) {
      var coordinate = evt.coordinate;
      MuestraPopupYacis(coordinate,feature);
    }
        return feature;
  }
  // else if (layer.get('name') == 'museos') {
  //   if (feature) {
  //     var coordinate = evt.coordinate;
  //     MuestraPopupMuseos(coordinate,feature);
  //   }
  //   return feature;
  // }
  else if (layer.get('name') == 'destino-tablillas') {
    if (feature) {
      var coordinate = evt.coordinate;
      MuestraPopupDestTablillas(coordinate,feature);
    }
    return feature;
  }
}

function FormatoContPopup(feature){
  var contenidoPopup = document.createElement('DIV');
  var claves = feature.getKeys();
  for (var i = 0; i < claves.length; i++) {
    var prefijo = claves[i].substring(0,8);
    if ((prefijo == 'mostrar_') && (feature.get(claves[i]))) {
      var prfClave = document.createElement('p');
      prfClave.setAttribute('class','pop-clave');
      prfClave.innerHTML = claves[i].substring(8).replace(/_/g, " ");
      var prfItem = document.createElement('p');
      prfItem.setAttribute('class','pop-item');
      prfItem.innerHTML = feature.get(claves[i]);
      contenidoPopup.appendChild(prfClave);
      contenidoPopup.appendChild(prfItem);
    }
    else if ((prefijo == '_enlace_') && (feature.get(claves[i]))) {
      var prfClave = document.createElement('p');
      prfClave.setAttribute('class','pop-clave');
      prfClave.innerHTML = claves[i].substring(8).replace(/_/g, " ");
      var prfItem = document.createElement('p');
      prfItem.setAttribute('class','pop-item');
      var txtItem = document.createElement('a');
      txtItem.innerHTML = feature.get(claves[i]);
      txtItem.setAttribute('href',feature.get(claves[i]));
      txtItem.setAttribute('target','_blank');
      prfItem.appendChild(txtItem);
      contenidoPopup.appendChild(prfClave);
      contenidoPopup.appendChild(prfItem);
    }
  }
  return contenidoPopup;
}

function MuestraPopupYacis(coord,feature){
  var element = document.getElementById('popup');
  var popup = mapa.getOverlays().item(0);//esto sólo funciona porque no tengo más overlays en el mapa. HACER BIEN
  var destinos = '<a href=javascript:SelecTablillasYaci("'+feature.get('id')+'",PonTablillasYaci)>ver destinos</a>';
  var tabYaciBD = '<a target="_blank"  href=http://bdtns.filol.csic.es/principal.php?numMuseo=&numBDTS=&numCDLI=&procedencia='+feature.get('nombre')+'&sello=TODOS&fechaPub=&datacion=&abreviatura=&autor=&propietario=&tipoobjeto=TODOS&tipotexto=TODOS&lexema_sello=&tipoperiodo=TODOS&tipolenguaje=TODOS&orden=>ver tablillas</a>';
  var plantilla = '<div class="popover" role="tooltip"><div class="popover-header" style="background-image:url('+feature.get('imagen')+')" title="Centros"></div><div class="arrow"></div><div onclick="javascript:CierraPops();" class="cierra-pop">X</div><div class="popover-pildoras">'+destinos+tabYaciBD+'</div><div class="popover-body"></div></div>';
  var titulo = feature.get('nombre');
  var contenido = FormatoContPopup(feature);
  $(element).popover('dispose');
      popup.setPosition(coord);
  $(element).popover({
    'placement': 'top',
    'animation': false,
    'html': true,
    'content': contenido,
    'title':'<h4 class="popover-titulo"><span>'+titulo+'</span></h4>',
    'template':plantilla
  });
  $(element).popover('show');
}

function MuestraPopupMuseos(coord,feature){
  var element = document.getElementById('popup');
  var popup = mapa.getOverlays().item(0);//esto sólo funciona porque no tengo más overlays en el mapa. HACER BIEN
  var plantilla = '<div class="popover" role="tooltip"><div class="popover-header" style="background-image:url('+feature.get('imagen')+')" title="Museo"></div><div class="arrow"></div><div onclick="javascript:CierraPops();" class="cierra-pop">X</div><div class="popover-body"></div></div>';
    var titulo = feature.get('nombre');
    var contenido = FormatoContPopup(feature);
  $(element).popover('dispose');
      popup.setPosition(coord);
  $(element).popover({
    'placement': 'top',
    'animation': false,
    'html': true,
    'content': contenido,
    'title':'<h4 class="popover-titulo"><span>'+titulo+'</span></h4>',
    'template':plantilla
  });
  $(element).popover('show');
}

function MuestraPopupDestTablillas(coord,feature){
  var element = document.getElementById('popup');
  var popup = mapa.getOverlays().item(0);//esto sólo funciona porque no tengo más overlays en el mapa. HACER BIEN
  var tabDestBD = '<a target="_blank"  href=http://bdtns.filol.csic.es/principal.php?numMuseo=&numBDTS=&numCDLI=&procedencia='+feature.get('mostrar_origen')+'&sello=TODOS&fechaPub=&datacion=&abreviatura=&autor=&propietario='+encodeURIComponent(feature.get('destino').trim())+'&tipoobjeto=TODOS&tipotexto=TODOS&lexema_sello=&tipoperiodo=TODOS&tipolenguaje=TODOS&orden=>ver tablillas</a>';
  var plantilla = '<div class="popover" role="tooltip"><div class="popover-header" style="background-image:url('+feature.get('imagen')+')" title="Destinos"></div><div class="arrow"></div><div onclick="javascript:CierraPops();" class="cierra-pop">X</div><div class="popover-pildoras">'+tabDestBD+'</div><div class="popover-body"></div></div>';
  var titulo = feature.get('destino');
  var contenido = FormatoContPopup(feature);
  $(element).popover('dispose');
  popup.setPosition(coord);
  $(element).popover({
    'placement': 'top',
    'animation': false,
    'html': true,
    'content': contenido,
    'title':'<h4 class="popover-titulo"><span>'+titulo+'</span></h4>',
    'template':plantilla
  });
  $(element).popover('show');
}

function CierraPops(){
	var elementos = mapa.getOverlays();
		elementos.forEach(function(element,index,array){
			var elemento = element.getElement();
			$(elemento).popover('dispose');
		})
}

function CentraMapa(resultado){
  var lugares = resultado.geonames;
  var coord = [Number(lugares[0].lng),Number(lugares[0].lat)];
  var coordProj = ol.proj.fromLonLat(coord);
  mapa.getView().setCenter(coordProj);
  mapa.getView().setZoom(10);
}

function PonLeyenda(){
    var leyDestino = objTipDest;
    var svg = d3.select("#svg-leyenda");
    svg.append("text")
      .attr("y", 20)
      .attr("x", 10)
      .style("font-size", '14px')
      .style("font-weight", 'bold')
      .style("text-anchor", "left")
      .text("Owners");
    var tipoDest = svg.selectAll("g")
        .data(leyDestino)
        .enter();
      tipoDest.append("circle")
        .attr("r", 5)
        .attr("cx", '10px')
        .attr("cy", function (d, i) {
          return (i+2) * 20;
        })
        .attr("fill", function (d,i){
          return d.color.hex;
        });
      tipoDest.append("text")
        .attr("x",20)
        .attr("y", function (d, i) {
          return (i+2) * 20.5;
        })
        .style("font-size", '12px')
        .attr("text-anchor", "left")
        .text(function(d){return d.texto;});
      svg.append("svg:image")
        .attr("y", function(){return (leyDestino.length*20.5)+30})
        .attr("x", 1)
        .attr('width', 20)
        .attr('height', 24)
        .attr("xlink:href", "./img/central.svg");
}

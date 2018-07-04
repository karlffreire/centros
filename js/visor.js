
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

function CargaCentros(callback){
  $.ajax({
    url: './datos/cargaCentros.php',
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

function PonCentros(resultado){
  var centros;
  var centrosIntegrados;
  var delegaciones;
  var capas = mapa.getLayers().getArray();
  for (var i = 0; i < capas.length; i++) {
    var nomcapa = capas[i].get('name');
    if (nomcapa == 'centros') {centros = capas[i];}
    else if (nomcapa == 'centros-integrados') {centrosIntegrados = capas[i];}
    else if (nomcapa == 'delegaciones') {delegaciones = capas[i];}
  }
  var geojsonCentros = new ol.format.GeoJSON().readFeatures(resultado);
  var centrosSource = new ol.source.Vector({
        features: ($.grep(geojsonCentros,function(centro){return centro.get('idarea')!=0||centro.get('idarea')!=9;}))
      });
  var delegacionesSource = new ol.source.Vector({
        features: ($.grep(geojsonCentros,function(centro){return centro.get('idarea')==0||centro.get('idarea')==9;}))
      });
  var agrupaCentros = new ol.source.Cluster({
        distance: 20,
        source: centrosSource,
        geometryFunction: function(f){
          if(f.get('integrado') == 't'){
            return f.getGeometry();
          }
          else{
             return null;
          }
        }
      });
  centrosIntegrados.setSource(agrupaCentros);
  centros.setSource(centrosSource);
  delegaciones.setSource(delegacionesSource);
  InitBuscaCentros(geojsonCentros);
}

function InitBuscaCentros(datos){
  var data = $.map(datos, function (obj) {
    obj.id = obj.id || obj.get('id');
    obj.text = obj.text || obj.get('nombre_centro') +' ('+obj.get('mostrar_siglas')+')';
    return obj;
  });
  $('#busca-centro').select2({
    data : data,
    placeholder: 'Buscador de centros',
    allowClear: true,
    theme: "bootstrap",
    width: 'copy'
  });
  $('#busca-centro').on('select2:select',function(){
    IrACentro();
  });
}

var objAreas = [
  {id:0,texto:'Servicios centrales',color:'#94346E'},
  {id:1,texto:'Humanidades y Ciencias Sociales',color:'#94346E'},
  {id:2,texto:'Biología y Biomedicina',color:'#38A6A5'},
  {id:3,texto:'Recursos Naturales',color:'#73AF48'},
  {id:4,texto:'Ciencias Agrarias',color:'#0F8554'},
  {id:5,texto:'Ciencia y Tecnologías Físicas',color:'#EDAD08'},
  {id:6,texto:'Ciencia y Tecnología de Materiales',color:'#E17C05'},
  {id:7,texto:'Ciencia y Tecnología de Alimentos',color:'#1D6996'},
  {id:8,texto:'Ciencia y Tecnologías Químicas',color:'#CC503E'},
  {id:9,texto:'Delegaciones',color:'#94346E'},
];

function ColorArea(idarea){
  var objArea = $.grep(objAreas,function(area){return area.id == idarea});
  return objArea[0].color;
}

function PonLeyenda(){
    var leyArea = $.grep(objAreas,function(area){return area.id != 0 && area.id != 9;});
    var svg = d3.select("#svg-leyenda");
    svg.append('circle')
    .attr("r", 5)
    .attr("cx", 10)
    .attr("cy", 15)
    .attr("fill", '#454545');
    svg.append("text")
      .attr("y", 20)
      .attr("x", 20)
      .style("font-size", '12px')
      .style("font-style", 'bold')
      .style("text-anchor", "left")
      .text("Centros, institutos y unidades de investigación");
    var areas = svg.selectAll("g")
        .data(leyArea)
        .enter();
      areas.append("circle")
        .attr("r", 5)
        .attr("cx", '20px')
        .attr("cy", function (d, i) {
          return (i+2) * 20;
        })
        .attr("fill", function (d,i){
          return d.color;
        });
      areas.append("text")
        .attr("x",30)
        .attr("y", function (d, i) {
          return (i+2) * 20.5;
        })
        .style("font-size", '12px')
        .attr("text-anchor", "left")
        .text(function(d){return d.texto;});
      svg.append("svg:image")
        .attr("y", function(){return (leyArea.length*20.5)+30})
        .attr("x", 1)
        .attr('width', 20)
        .attr('height', 24)
        .attr("xlink:href", "./img/central.svg");
      svg.append("text")
        .attr("y", function(){return (leyArea.length*20.5)+50})
        .attr("x", 22)
        .style("font-size", '12px')
        .style("font-style", 'bold')
        .style("text-anchor", "left")
        .text("Organización central");
        svg.append("svg:image")
          .attr("y", function(){return (leyArea.length*20.5)+65})
          .attr("x", 3)
          .attr('width', 16)
          .attr('height', 16)
          .attr("xlink:href", "./img/estrella.svg");
        svg.append("text")
          .attr("y", function(){return (leyArea.length*20.5)+80})
          .attr("x", 22)
          .style("font-size", '12px')
          .style("font-style", 'bold')
          .style("text-anchor", "left")
          .text("Delegaciones");
}

function EstiloCentros(feature) {
  if (feature.get('integrado')=='f') {
    var radio = 8;
    if ((feature.get('idarea') != 0)&&(feature.get('idarea') != 9)) {
      var relleno = ColorArea(feature.get('idarea'));
      var circulo = new ol.style.Circle({
        radius: radio,
        stroke: new ol.style.Stroke({
          width: 2,
          color: '#CCC'
        }),
        fill: new ol.style.Fill({
          color: relleno
        }),
        rotateWithView: true
      });
      var estilo_centro = new ol.style.Style({
        image: circulo
      });
      return [estilo_centro];
    }
  }
}

function EstiloCentrosIntegrados(feature) {
  var relleno;
  if (IsCluster(feature)) {
    var areas = [];
    var centros = feature.get('features');
    for (var i = 0; i < centros.length; i++) {
      areas.push(centros[i].get('idarea'));
    }
    var radio = Math.min(feature.get('features').length, 6) + 7;
    relleno = ColorArea(mode(areas));
  }
  else{
    relleno = ColorArea(feature.get('features')[0].get('idarea'));
		var radio = 8;
  }
  var circulo = new ol.style.Circle({
    radius: radio,
    stroke: new ol.style.Stroke({
      width: 2,
      color: '#CCC'
    }),
    fill: new ol.style.Fill({
      color: relleno
    }),
    rotateWithView: true
  });
	var estilo_centro = new ol.style.Style({
        image: circulo
    });
    return [estilo_centro];
}

function EstiloDelegaciones(feature) {
  if (feature.get('integrado')=='f') {
    var radio = 8;
      if (feature.get('idarea') == 0) {
        var globo = new ol.style.Icon( {
          anchor: [0.5, 0.5],
          src: './img/central.svg',
          scale: 0.8,
          size: [35,45],
          imgSize: [30,40]
        });
        var estilo_centro = new ol.style.Style({
          image: globo
        });
        return [estilo_centro];
      }
      else if (feature.get('idarea') == 9) {
        var globo = new ol.style.Icon( {
          anchor: [-0.5, 0.5],
          src: './img/estrella.svg',
          scale: 0.8,
          size: [20,20],
          imgSize: [20,20]
        });
        var estilo_centro = new ol.style.Style({
          image: globo
        });
        return [estilo_centro];
      }
  }
}

function InitMapa(){
  var mapbox = new ol.layer.Tile({
        source: new ol.source.XYZ({
          attributions: ' Basemap by <a href="https://www.mapbox.com/about/maps/">© Mapbox</a> | <a href="http://www.openstreetmap.org/copyright">© OpenStreetMap</a> | <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a>',
          url: urlMapbox
        })
      });
    var centros = new ol.layer.Vector({
            style: EstiloCentros
          });
      centros.set('name', 'centros');
    var delegaciones = new ol.layer.Vector({
            style: EstiloDelegaciones
          });
      delegaciones.set('name', 'delegaciones');
    var centrosIntegrados = new ol.layer.Vector({
            style: EstiloCentrosIntegrados
          });
      centrosIntegrados.set('name', 'centros-integrados');
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
      layers: [mapbox,centrosIntegrados,centros,delegaciones],
      view: new ol.View({
        projection: 'EPSG:3857',
        center: [-288976.121475105, 4868797.98060151],
        minZoom: 2,
        maxZoom:18,
        zoom: 5,
        extent: [-3268931,2703396,2888198,7220756]
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
    mapa.forEachFeatureAtPixel(evt.pixel,function(feature,layer){
    DisparaPopup(evt,feature,layer);
      });
    });
}

function IrACentro(){
  var centro = $("#busca-centro").select2('data')[0];
  mapa.getView().fit(centro.getGeometry(), {duration: 1000});
  // mapa.once('moveend', function(evt) {
  //     var centroEnCoordenadas = mapa.getView().getCenter();
  //     var centroEnPixeles = mapa.getPixelFromCoordinate(centroEnCoordenadas);
  //     var featureIntersectada = mapa.getFeaturesAtPixel(centroEnPixeles);
  //     DisparaPopup(centroEnCoordenadas,featureIntersectada[0],mapa.getLayers().getArray()[2]);
  //   });
}

function DisparaPopup(evt,feature,layer){
  if (layer.get('name') == 'centros') {
    if (feature) {
         var coordinate = evt.coordinate;
         MuestraPopupCentros(coordinate,feature);
    }
        return feature;
  }
  if (layer.get('name') == 'centros-integrados') {
    if (feature) {
         var coordinate = evt.coordinate;
         MuestraPopupCentrosIntegrados(coordinate,feature);
    }
        return feature;
  }
  if (layer.get('name') == 'delegaciones') {
    if (feature) {
         var coordinate = evt.coordinate;
         MuestraPopupDelegaciones(coordinate,feature);
    }
        return feature;
  }
}

function FormatoContPopup(feature,integrado){
  var contenidoPopup = document.createElement('DIV');
  var claves = feature.getKeys();
  if (integrado) {
    var prfClave = document.createElement('p');
    prfClave.setAttribute('class','pop-clave');
    prfClave.innerHTML = 'Nombre del centro';
    var prfItem = document.createElement('p');
    prfItem.setAttribute('class','pop-item');
    prfItem.innerHTML = feature.get('nombre_centro');
    contenidoPopup.appendChild(prfClave);
    contenidoPopup.appendChild(prfItem);
  }
  for (var i = 0; i < claves.length; i++) {
    var prefijo = claves[i].substring(0,8);
    if (claves[i] == 'mostrar_director' && feature.get('mostrar_director')) {
      var prfClave = document.createElement('p');
      prfClave.setAttribute('class','pop-clave');
      prfClave.innerHTML = 'Director/a';//claves[i].substring(8).replace(/_/g, " ");
      var prfItem = document.createElement('p');
      prfItem.setAttribute('class','pop-item');
      var txtItem = document.createElement('a');
      txtItem.innerHTML = feature.get(claves[i]);
      if (feature.get('foto_director')) {
        txtItem.setAttribute('href',feature.get('foto_director'));
        txtItem.setAttribute('target','_blank');
      }
      prfItem.appendChild(txtItem);
      contenidoPopup.appendChild(prfClave);
      contenidoPopup.appendChild(prfItem);
    }
    else if (claves[i] == 'mostrar_delegado' && feature.get('mostrar_delegado')) {
      var prfClave = document.createElement('p');
      prfClave.setAttribute('class','pop-clave');
      prfClave.innerHTML = 'Delegado/a';//claves[i].substring(8).replace(/_/g, " ");
      var prfItem = document.createElement('p');
      prfItem.setAttribute('class','pop-item');
      var txtItem = document.createElement('a');
      txtItem.innerHTML = feature.get(claves[i]);
      if (feature.get('foto_director')) {
        txtItem.setAttribute('href',feature.get('foto_director'));
        txtItem.setAttribute('target','_blank');
      }
      prfItem.appendChild(txtItem);
      contenidoPopup.appendChild(prfClave);
      contenidoPopup.appendChild(prfItem);
    }
    else if (claves[i] == 'mostrar_presidenta' && feature.get('mostrar_presidenta')) {
      var prfClave = document.createElement('p');
      prfClave.setAttribute('class','pop-clave');
      prfClave.innerHTML = claves[i].substring(8).replace(/_/g, " ");
      var prfItem = document.createElement('p');
      prfItem.setAttribute('class','pop-item');
      var txtItem = document.createElement('a');
      txtItem.innerHTML = feature.get(claves[i]);
      if (feature.get('foto_director')) {
        txtItem.setAttribute('href',feature.get('foto_director'));
        txtItem.setAttribute('target','_blank');
      }
      prfItem.appendChild(txtItem);
      contenidoPopup.appendChild(prfClave);
      contenidoPopup.appendChild(prfItem);
    }
    else if ((prefijo == 'mostrar_') && (feature.get(claves[i]))) {
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

function MuestraPopupCentros(coord,feature){
  var element = document.getElementById('popup');
  var popup = mapa.getOverlays().item(0);//esto sólo funciona porque no tengo más overlays en el mapa. HACER BIEN
  var plantilla = '<div class="popover" role="tooltip"><div class="popover-header" style="background-image:url('+feature.get('foto')+')" title="Centros"></div><div class="arrow"></div><div onclick="javascript:CierraPops();" class="cierra-pop">X</div><div class="popover-body"></div></div>';
    var titulo = feature.get('nombre_centro');
    var contenido = FormatoContPopup(feature,false);
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

function MuestraPopupCentrosIntegrados(coord,feature){
    var element = document.getElementById('popup');
    var popup = mapa.getOverlays().item(0);//esto sólo funciona porque no tengo más overlays en el mapa. HACER BIEN
    var plantilla;
    var titulo,contenido;
    var feats = feature.getProperties().features;
    if (feats.length == 1) {
      titulo = feats[0].get('nombre_centro');
      plantilla = '<div class="popover" role="tooltip"><div class="popover-header" style="background-image:url('+feats[0].get('foto')+')" title="Centros"></div><div class="arrow"></div><div onclick="javascript:CierraPops();" class="cierra-pop">X</div><div class="popover-body"></div></div>';
      contenido = FormatoContPopup(feats[0],false);
    }
    else{
      var centroPpal = false;
      centroPpal = $.grep(feats,function(centro){return centro.get('principal') == "t";})[0];
      if (!centroPpal) {
        centroPpal = feats[0];
      }
      titulo = centroPpal.get('nombre_centro');
      var pildoras = '<ul class="nav nav-pills">';
      contenido = document.createElement('div');
        contenido.setAttribute('class','tab-content');
      for (var i = 0; i < feats.length; i++) {
        var panelCentro = document.createElement('div');
         $(panelCentro).addClass('tab-pane fade');
         panelCentro.setAttribute('role','tabpanel');
         panelCentro.setAttribute('id',feats[i].get('mostrar_siglas'));
         panelCentro.appendChild(FormatoContPopup(feats[i],true));
         if (feats[i].get('mostrar_siglas') == centroPpal.get('mostrar_siglas')) {
           $(panelCentro).addClass('show active');
           pildoras += '<li class="nav-item"><a class="nav-link active" id="pil-'+feats[i].get('mostrar_siglas')+'" data-toggle="tab" href="#'+feats[i].get('mostrar_siglas')+'" role="tab" aria-controls="nav-yac" aria-selected="true">'+feats[i].get('mostrar_siglas')+'</a></li>';
         }
         else{
           pildoras += '<li class="nav-item"><a class="nav-link" id="pil-'+feats[i].get('mostrar_siglas')+'" data-toggle="tab" href="#'+feats[i].get('mostrar_siglas')+'" role="tab" aria-controls="nav-yac" aria-selected="true">'+feats[i].get('mostrar_siglas')+'</a></li>';
         }
         contenido.appendChild(panelCentro);
      }
      pildoras += '</ul>';
      plantilla = '<div class="popover" role="tooltip"><div class="popover-header" style="background-image:url('+centroPpal.get('foto')+')" title="Centros"></div><div class="arrow"></div><div onclick="javascript:CierraPops();" class="cierra-pop">X</div><div class="popover-pildoras">'+pildoras+'</div><div class="popover-body"></div></div>';

    }
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

function MuestraPopupDelegaciones(coord,feature){
  var element = document.getElementById('popup');
  var popup = mapa.getOverlays().item(0);//esto sólo funciona porque no tengo más overlays en el mapa. HACER BIEN
  var plantilla = '<div class="popover" role="tooltip"><div class="popover-header" style="background-image:url('+feature.get('foto')+')" title="Centros"></div><div class="arrow"></div><div onclick="javascript:CierraPops();" class="cierra-pop">X</div><div class="popover-body"></div></div>';
    var titulo = feature.get('nombre_centro');
    var contenido = FormatoContPopup(feature,false);
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


function Localiza(callbackData) {
  var termino = document.getElementById('term-buscar').value;
  $.ajax({
      url: 'http://api.geonames.org/searchJSON?',
      data: {
        username: 'visualizador_hd',
        q:termino,
        maxRows: 5,
        country: 'ES'
      },
      dataType: 'json',
      success:function(data){
        callbackData(data);
      }
    });
};

function CentraMapa(resultado){
  var lugares = resultado.geonames;
  var coord = [Number(lugares[0].lng),Number(lugares[0].lat)];
  var coordProj = ol.proj.fromLonLat(coord);
  mapa.getView().setCenter(coordProj);
  mapa.getView().setZoom(10);
}

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
  var capas = mapa.getLayers().getArray();
  for (var i = 0; i < capas.length; i++) {
    var nomcapa = capas[i].get('name');
    if (nomcapa == 'centros') {centros = capas[i];}
    else if (nomcapa == 'centros-integrados') {centrosIntegrados = capas[i];}
  }
  var geojsonCentros = resultado;
  var centrosSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(geojsonCentros)
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
}

function ColorArea(idarea){
  if (idarea == 1) {
    return '#94346E';
  }
  if (idarea == 2) {
    return '#38A6A5';
  }
  if (idarea == 3) {
    return '#73AF48';
  }
  if (idarea == 4) {
    return '#0F8554';
  }
  if (idarea == 5) {
    return '#EDAD08';
  }
  if (idarea == 6) {
    return '#E17C05';
  }
  if (idarea == 7) {
    return '#1D6996';
  }
  if (idarea == 8) {
    return '#CC503E';
  }
}

function EstiloCentros(feature) {
  if (feature.get('integrado')=='f') {
    var relleno = ColorArea(feature.get('idarea'));
    var radio = 8;

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

function EstiloCentrosIntegrados(feature) {
  var relleno = ColorArea(feature.get('idarea'));
  if (IsCluster(feature)) {
    var areas = [];
    var centros = feature.get('features');
    for (var i = 0; i < centros.length; i++) {
      areas.push(centros[i].get('idarea'));
    }
    var radio = Math.min(feature.get('features').length, 6) + 5;
    //var factor = Math.log(feature.get('features').length+1);
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

function InitMapa(){
  var osm = new ol.layer.Tile({
            source: new ol.source.OSM(),
            attributions:'OL contributors'
          });
    var centros = new ol.layer.Vector({
            style: EstiloCentros
          });
      centros.set('name', 'centros');
    var centrosIntegrados = new ol.layer.Vector({
            style: EstiloCentrosIntegrados
          });
      centrosIntegrados.set('name', 'centros-integrados');
  mapa = new ol.Map({
      controls: [
        new ol.control.Zoom({
          className: 'zoom-centros'
        }),
        new ol.control.ScaleLine(),
      //   new ol.control.OverviewMap({
      //     layers:[osm],
      //     className: 'ol-custom-overviewmap'
      // })
      ],
      layers: [osm,centrosIntegrados,centros],
      view: new ol.View({
        projection: 'EPSG:3857',
        center: [-288976.121475105, 4868797.98060151],
        minZoom: 2,
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
    var feature = mapa.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
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
      });
    });
}

function FormatoContPopup(feature){
  var contenidoPopup = document.createElement('DIV');
  var claves = feature.getKeys();
  for (var i = 0; i < claves.length; i++) {
    var prefijo = claves[i].substring(0,8);
    if (prefijo == 'mostrar_') {
      var prfClave = document.createElement('p');
      prfClave.setAttribute('class','pop-clave');
      prfClave.innerHTML = claves[i].substring(8).replace(/_/g, " ");
      var prfItem = document.createElement('p');
      prfItem.setAttribute('class','pop-item');
      prfItem.innerHTML = feature.get(claves[i]);
      contenidoPopup.appendChild(prfClave);
      contenidoPopup.appendChild(prfItem);
    }
    if (prefijo == '_enlace_') {
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
    var contenido = FormatoContPopup(feature);
  $(element).popover('dispose');
      popup.setPosition(coord);
  $(element).popover({
    'placement': 'top',
    'animation': false,
    'html': true,
    'content': contenido,
    'title':'<span class="popover-titulo">'+titulo+'</span>',
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
      titulo = feats[0].get('mostrar_centro');
      plantilla = '<div class="popover" role="tooltip"><div class="popover-header" style="background-image:url('+feats[0].get('foto')+')" title="Centros"></div><div class="arrow"></div><div onclick="javascript:CierraPops();" class="cierra-pop">X</div><div class="popover-body"></div></div>';
      contenido = FormatoContPopup(feats[0]);
    }
    else{
      var centroPpal = $.grep(feats,function(centro){return centro.get('principal') == "t";})[0];
      titulo = centroPpal.get('nombre_centro');
      var pildoras = '<ul class="nav nav-pills">';
      contenido = document.createElement('div');
        contenido.setAttribute('class','tab-content');//CREO QUE NO ESTÁN FUNCIONANDO LOS ENLACES, HACER CON JS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      for (var i = 0; i < feats.length; i++) {
        var panelCentro = document.createElement('div');
         $(panelCentro).addClass('tab-pane fade');
         panelCentro.setAttribute('role','tabpanel');
         panelCentro.setAttribute('id',feats[i].get('mostrar_siglas'));
         panelCentro.appendChild(FormatoContPopup(feats[i]));
         if (feats[i].get('mostrar_siglas') == centroPpal.get('mostrar_siglas')) {
           $(panelCentro).addClass('show active');
           pildoras += '<li class="nav-item"><a class="nav-link active" id="'+feats[i].get('mostrar_siglas')+'" data-toggle="tab" href="#'+feats[i].get('mostrar_siglas')+'" role="tab" aria-controls="nav-yac" aria-selected="true">'+feats[i].get('mostrar_siglas')+'</a></li>';
         }
         else{
           pildoras += '<li class="nav-item"><a class="nav-link" id="'+feats[i].get('mostrar_siglas')+'" data-toggle="tab" href="#'+feats[i].get('mostrar_siglas')+'" role="tab" aria-controls="nav-yac" aria-selected="true">'+feats[i].get('mostrar_siglas')+'</a></li>';
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
      'title':'<span class="popover-titulo">'+titulo+'</span>',
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

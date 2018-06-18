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
      //     className: 'ol-overviewmap ol-custom-overviewmap'
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

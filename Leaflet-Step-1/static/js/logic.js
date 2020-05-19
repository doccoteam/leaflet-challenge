// Setting a query URL
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"


d3.json(queryUrl, function(data) {

  createFeatures(data.features);
  // console.log(data.features)
});

function createFeatures(earthquakeData) {

  function onEachFeature(feature, layer) {
    // console.log(feature.coordinates);
    layer.bindPopup("Place:"+feature.properties.place + "<br> Magnitude: "+feature.properties.mag+"<br> Time: "
       + new Date(feature.properties.time));

  }

  function radiusSize(magnitude) {
    return magnitude * 20000;
  }


  function circleColor(magnitude) {
    if (magnitude < 1) {
      return "#ffffd0"
    }
    else if (magnitude < 2) {
      return "#ffff1f"
    }
    else if (magnitude < 3) {
      return "#ffbb33"
    }
    else if (magnitude < 4) {
      return "#ff8833"
    }
    else if (magnitude < 5) {
      return "#ff4433"
    }
    else {
      return "#dcf8d2"
    }
  }


  var equakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        color: circleColor(earthquakeData.properties.mag),
        fillOpacity: 1,
        weight: 2,
      });
    },
    // onEachFeature: onEachFeature
    onEachFeature: function(feature,layer){
      layer.bindPopup("Place:"+feature.properties.place + "<br> Magnitude: "+feature.properties.mag+"<br> Time: "
       + new Date(feature.properties.time));
  },
  });

  createMap(equakes);
}

function createMap(equakes) {


  var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Fault line layer
  var faultLine = new L.LayerGroup();
  
  // Defining a baseMaps object
  var baseMaps = {
    "Outdoor Map": outdoorsmap,
    "Greyscale Map": grayscalemap,
    "Satellite Map": satellitemap
  };

  // Overlay object 
  var overlayMaps = {
    "Earthquakes": equakes,
    "Fault Lines": faultLine
  };

  // Map with layers
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [outdoorsmap, equakes, faultLine]
  });

// Adding the layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

// Query to retrieve the faultline data
  var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
// Creating the faultlines, adding to the faultline layer
  d3.json(faultlinequery, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "#ff7b00", fillOpacity: 0}
      }
    }).addTo(faultLine)
  })

  // Creating the legend
  function legendColor(d) {
    return d > 5 ? "#ff4433" :
           d > 4  ? "#ff8833" :
           d > 3  ? "#ffbb33" :
           d > 2  ? "#ffff1f" :
           d > 1  ? "#ffffd0" :
                    "#dcf8d2";
  }

// Adding legend to the map
  var legendControl = L.control({position: 'bottomleft'});
  
  legendControl.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          mags = [0, 1, 2, 3, 4, 5],
          labels = [];

          
      for (var i = 0; i < mags.length; i++) {
          div.innerHTML +=
              '<i style="background:' + legendColor(mags[i] + 1) + '"></i> ' + '&nbsp'+
              mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  
  legendControl.addTo(myMap);
}
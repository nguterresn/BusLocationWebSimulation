/*var data = '{"coo":[' +
'{"lat":"41.283813","lng":-8.568663 },' +
'{"lat":"41.283786","lng":-8.568360 },' +
'{"lat":"41.283821","lng":"-8.569832" },' +
'{"lat":"41.283780","lng":"-8.571136" },' +
'{"lat":"41.283740","lng":"-8.573566" },' +
'{"lat":"41.283745","lng":"-8.574929" },' +
'{"lat":"41.284066","lng":"-8.578514" },' +
'{"lat":"41.284066","lng":"-8.578514" },' +
'{"lat":"41.284066","lng":"-8.578514" },' +
'{"lat":"41.284066","lng":"-8.578514" },' +
'{"lat":"41.283054","lng":"-8.580569" },' +
'{"lat":"41.282873","lng":"-8.583361" }]}';*/

//https://www.google.com/maps/dir/41.2837096,-8.567697/
//41.2837433,-8.5678425
//41.2837661,-8.5679916
//41.2837842,-8.5681177
//41.2837869,-8.5682386
//41.2837903,-8.5683551
//41.2837913,-8.5684625
//@41.2836778,-8.5684933,20z/data=!4m2!4m1!3e2

var data = '{"coo":[' +
'{"lat":"41.2837096","lng":-8.567697 },' +
'{"lat":"41.283745","lng":-8.567840 },' +
'{"lat":"41.2837661","lng":-8.5679916 },' +
'{"lat":"41.2837842","lng":-8.5681177 },' +
'{"lat":"41.2837869","lng":-8.5682386 },' +
'{"lat":"41.2837903","lng":-8.5683551},' +
'{"lat":"41.2837913","lng":-8.5684625 },' +
'{"lat":"41.2837913","lng":-8.5684625 },' +
'{"lat":"41.2837913","lng":-8.5684625 },' +
'{"lat":"41.283795","lng":"-8.568591" }]}';

var obj = JSON.parse(data);

var map, marker, latLngMarker, index, heatmapData = [], totalDistance;

/* SETUP */
window.onload = function () {
	
	/* SETUP MAP */
	this.initMap();

	/* EVENTS */
	document.getElementById("startbtn").addEventListener("click", StartSimulation);	

}	



function StartSimulation(){

	index = 0, totalDistance = 0;
	
	var inter = setInterval(function(){

		latLngMarker = new google.maps.LatLng(obj.coo[index].lat,obj.coo[index].lng);

		ChangesMarkerPos(latLngMarker);

		/* Inserts in last position */
		heatmapData.push(latLngMarker);

		window.document.getElementById("lat-text").innerHTML = obj.coo[index].lat;
		window.document.getElementById("lng-text").innerHTML = obj.coo[index].lng;

		if (index > 0) {
			var dist = distanceInMBetweenEarthCoordinates(obj.coo[index-1].lat, obj.coo[index-1].lng, obj.coo[index].lat, obj.coo[index].lng);
			var vel = dist * 3.6;

			if (vel == 0 && dist == 0) {
				window.document.getElementById("distance-text").innerHTML = "Bus has stopped!";
				window.document.getElementById("velocity-text").innerHTML = "Bus has stopped!";
			} else {
				window.document.getElementById("distance-text").innerHTML = " " + dist.toFixed(3) + " (m)";
				window.document.getElementById("velocity-text").innerHTML = " " + vel.toFixed(1) + " (km/h)";
				totalDistance += dist;
			}
		} 

		/* +1 position, so -1 */
		if (index == obj.coo.length-1) {

			generatesHeatMap(heatmapData);
			window.document.getElementById("totalDist").innerHTML = totalDistance.toFixed(2) + "(m)";
			window.document.getElementById("endSimu-text").innerHTML = "<strong>End of Simulation</strong>";
			clearInterval(inter);

		}

		index++;

	}, 1000);
}

function initMap() {

	var MaplatLng = new google.maps.LatLng(obj.coo[0].lat,obj.coo[0].lng);

	map = new google.maps.Map(document.getElementById('map'), {
        center: MaplatLng,
        zoom: 18
	});

	marker = new google.maps.Marker({
		position: MaplatLng,
		map: map,
		draggable: false,
		icon: 'http://findicons.com/files/icons/1496/world_of_copland_2/32/school_bus.png',
	});
}

function generatesHeatMap (heatmapData) {

	/* generates heatMap */
	var heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatmapData
	  });
	heatmap.setMap(map);

}

function ChangesMarkerPos (latLngMarker) {
	marker.setPosition(latLngMarker);
	map.setCenter(latLngMarker);
}

function distanceInMBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
	var earthRadiusKm = 6371;
  
	var dLat = degreesToRadians(lat2-lat1);
	var dLon = degreesToRadians(lon2-lon1);
  
	lat1 = degreesToRadians(lat1);
	lat2 = degreesToRadians(lat2);
  
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	return earthRadiusKm * c * 1000;
}

function degreesToRadians(degrees) {
	return degrees * Math.PI / 180;
  }






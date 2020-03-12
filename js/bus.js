/**
 * Bus.js
 */

var map, marker, latLngMarker, index, heatmapData = [], totalDistance, heatmap, PathObject;

var coordinates = {
	bus: [
		{
			lat: [41.2837096, 41.283745, 41.2837661, 41.2837842, 41.2837869, 41.2837903, 41.2837913, 41.2837913, 41.2837913, 41.283795],
			lng: [-8.567697, -8.567840, -8.5679916, -8.5681177, -8.5682386, -8.5683551, -8.5684625, -8.5684625, -8.5684625, -8.568591],
			stop: {
				lat: [41.283795],
				lng: [-8.568591]
			}
		},
		{
			lat: [41.2837096, 41.283683, 41.283653, 41.283616, , , , , , , , , , , ,],
			lng: [-8.567697, 8.567548, 8.567350, 8.567181, , , , , , , , , , , ,],
			stop: {
				lat: [41.283795, 41.283745],
				lng: [-8.568591, -8.567840]
			}
		},
		{
			lat: [],
			lng: [],
			stop: {
				lat: [41.3795],
				lng: [-8.568591]
			}
		},
		
	],
	/* needed to handle all markers  and be able to delete */
	markers: [],
};

/* SETUP */
window.onload = function () {

	/* As Default, the Bus is the 1 */
	var busNumber = 0;

	/* SETUP MAP */
	this.initMap(busNumber);

	/* EVENTS */	
	document.getElementById("startbtn").addEventListener('click', function() {
		StartSimulation( busNumber );
		deleteHeatMap();
	});

	var selectBus = document.getElementById("busnumber");
	selectBus.addEventListener("change", function() {
		busNumber = selectBus.value;

		/* Remove multiple Markers */
		RemoveMarkers();

		/* Add multiple Markers */
		AddMultipleMarkers(busNumber);

		CreatePath(busNumber);
	});	

}	

function StartSimulation( busNumber ){

	index = 0, totalDistance = 0;
	
	var inter = setInterval(function(){

		latLngMarker = new google.maps.LatLng(coordinates.bus[busNumber].lat[index],coordinates.bus[busNumber].lng[index]);

		ChangesMarkerPos(latLngMarker);

		/* Inserts in last position */
		heatmapData.push(latLngMarker);

		window.document.getElementById("lat-text").innerHTML = coordinates.bus[busNumber].lat[index];
		window.document.getElementById("lng-text").innerHTML = coordinates.bus[busNumber].lng[index];

		if (index > 0) {
			var dist = distanceInMBetweenEarthCoordinates(coordinates.bus[busNumber].lat[index-1], coordinates.bus[busNumber].lng[index-1], coordinates.bus[busNumber].lat[index], coordinates.bus[busNumber].lng[index]);
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
		if (index == (coordinates.bus[busNumber].lat.length)-1) {

			generatesHeatMap(heatmapData);
			window.document.getElementById("totalDist").innerHTML = totalDistance.toFixed(2) + "(m)";
			window.document.getElementById("endSimu-text").innerHTML = "<strong>End of Simulation</strong>";
			clearInterval(inter);

		}

		index++;

	}, 1000);
}

function initMap( busNumber ) {

	var MaplatLng = new google.maps.LatLng(coordinates.bus[busNumber].lat[0],coordinates.bus[busNumber].lng[0]);

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
	heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatmapData
	});
	heatmap.setMap(map);

}

function deleteHeatMap () {

	/* If heatmap already exists: clears heatmap data */
	if (typeof heatmap != "undefined") {
		heatmap.setMap(null);
	}

}

function clearMarkers() {
	setMapOnAll(null);
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

function RemoveMarkers() {
	for(let i = 0; i < coordinates.markers.length; i++) {
		coordinates.markers[i].setMap(null);
	}
}

function AddMultipleMarkers (busNumber) {
	/* Add multiple Markers */
	for (let i = 0; i < coordinates.bus[busNumber].stop.lat.length; i++) {
			 
		stopLatLng = new google.maps.LatLng(coordinates.bus[busNumber].stop.lat[i], coordinates.bus[busNumber].stop.lng[i]);

		var marker = new google.maps.Marker({
			position: stopLatLng,
			map: map
		});

		/* Add to array 'markers' after adding marker */
		coordinates.markers.push(marker);

	 }
}

function CreatePath( busNumber ) {

	var busPath = [];

	for (let index = 0; index < coordinates.bus[busNumber].lat.length; index++) {

		busPath.push({lat: coordinates.bus[busNumber].lat[index],lng: coordinates.bus[busNumber].lng[index]});
		
	}
	
	PathObject = new google.maps.Polyline({
		path: busPath,
		geodesic: true,
		strokeColor: '#FF0000',
		strokeOpacity: 1.0,
		strokeWeight: 1
	});

	PathObject.setMap(map);

}

function DeletePath() {
	PathObject.setMap(null);
}


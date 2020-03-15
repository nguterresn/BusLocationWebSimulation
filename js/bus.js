/**
 * Bus.js
 */

/* global scope variables */
var 	map, 
		heatmap, 
		PathObject, 
		enableCenter;

var coordinates = {
	bus: [
		{
			lat: [41.2837096, 41.283745, 41.2837661, 41.2837842, 41.2837869, 41.2837903, 41.2837913, 41.2837913, 41.2837913, 41.283795],
			lng: [-8.567697, -8.567840, -8.5679916, -8.5681177, -8.5682386, -8.5683551, -8.5684625, -8.5684625, -8.5684625, -8.568591],
			stop: {
				lat: [41.283795],
				lng: [-8.568591]
			},
			icon: {},
			infoWindow: {}
		},
		{
			lat: [41.2837096, 41.283683, 41.283653, 41.283616, 41.283588, 41.283550, 41.283497, 41.283497, 41.283497, 41.283467, 41.283435, 41.283393, 41.283346, 41.283302, 41.283262, 41.283215, 41.283171],
			lng: [-8.567697, -8.567548, -8.567350, -8.567181, -8.567033, -8.566843, -8.566682, -8.566682, -8.566682, -8.566435, -8.566239, -8.566030, -8.565821, -8.565585, -8.565397, -8.565158, -8.564954],
			stop: {
				lat: [41.283497],
				lng: [-8.566682]
			},
			icon: {},
			infoWindow: {}
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
	path: [],
	heatmapData: [],
};

/* SETUP */
window.onload = function () {

	/* As Default, the Bus is the 1 */
	var busNumber = 0,
	toggleMarker = 0,
	toggleLine = 0,
	toggleDetails = 0;

	enableCenter = 0;

	/* SETUP MAP */
	initMap(busNumber);

	/* EVENTS */	
	document.getElementById("hideline").addEventListener('click', function() {
		toggleLine = !toggleLine;
		toggleLine ? DontShowPath() : ShowPath();
	});

	document.getElementById("focus").addEventListener('click', function() {
		enableCenter = !enableCenter;
	});

	document.getElementById("hidemarkers").addEventListener('click', function() {
		toggleMarker = !toggleMarker;
		toggleMarker ? DontShowMarkers() : ShowMarkers();
	});

	document.getElementById("hidedetails").addEventListener('click', function() {
		toggleDetails = !toggleDetails;
		toggleDetails ? document.getElementById("details").style.visibility = "hidden" : document.getElementById("details").style.visibility = "visible";
	});

	document.getElementById("startbtn").addEventListener('click', function() {
		StartSimulation( busNumber );
	});

	var selectBus = document.getElementById("busnumber");
	selectBus.addEventListener("change", function() {
		/* <option> value */
		busNumber = selectBus.value;

		/* Deletes any kind of Heat Map */
		deleteHeatMap(coordinates.heatmapData);

		/* Removes multiples Markers */
		RemoveMarkers();

		/* Add multiple Markers */
		AddMultipleMarkers(busNumber);

		/* Removes any polylines */
		RemovePath();

		/* Creates polylines based on coordinates */
		CreatePath(busNumber);
	});	

}	

function StartSimulation(busNumber){

	var index = 0;
	var totalDistance = 0;

	CleanTextValues();

	/* Saves a IconObject in coordinates.bus[busnumber].icon */
	/* In this way, it is possible to handle multiple icons per map */
	CreateIconObject(busNumber);

	repeatSimulation(busNumber, index, totalDistance);
	
}

function repeatSimulation(busNumber, index, totalDistance) {

	var inter =  setTimeout(function(){

		var latLngMarker = new google.maps.LatLng(coordinates.bus[busNumber].lat[index],coordinates.bus[busNumber].lng[index]);

		ChangesMarkerPos(coordinates.bus[busNumber].icon, latLngMarker);

		/* Inserts in last position */
		coordinates.heatmapData.push(latLngMarker);

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

		UpdateInfoWindow(busNumber, coordinates.bus[busNumber].lat[index], coordinates.bus[busNumber].lng[index], dist, vel);

		/* +1 position, so -1 */
		if (index == (coordinates.bus[busNumber].lat.length)-1) {

			generatesHeatMap(coordinates.heatmapData);
			window.document.getElementById("totalDist").innerHTML = totalDistance.toFixed(2) + "(m)";
			window.document.getElementById("endSimu-text").innerHTML = "<strong>End of Simulation</strong>";
			clearTimeout(inter);

		} 
		else {

			index++;

			repeatSimulation( busNumber, index, totalDistance);

		}

	}, 1000);

}

function initMap( busNumber ) {

	var MaplatLng = new google.maps.LatLng(coordinates.bus[busNumber].lat[0],coordinates.bus[busNumber].lng[0]);

	map = new google.maps.Map(document.getElementById('map'), {
        center: MaplatLng,
        zoom: 18
	});
}

function generatesHeatMap (heatmapData) {

	/* generates heatMap */
	heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatmapData
	});
	heatmap.setMap(map);

}

function deleteHeatMap (heatmapData) {

	/* If heatmap already exists: clears heatmap data */
	if (typeof heatmap != "undefined") {
		heatmap.setMap(null);
	}

	for (let index = 0; index < coordinates.heatmapData.length; index++) coordinates.heatmapData.shift();

}

function ChangesMarkerPos (iconObject, latLngMarker) {

	iconObject.setPosition(latLngMarker);

	if (enableCenter) map.setCenter(latLngMarker);
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
		coordinates.markers.shift();
	}
}

function DontShowMarkers() {
	for(let i = 0; i < coordinates.markers.length; i++) {
		coordinates.markers[i].setMap(null);
	}
}

function ShowMarkers() {
	for(let i = 0; i < coordinates.markers.length; i++) {
		coordinates.markers[i].setMap(map);
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

function CreatePath(busNumber) {

	var busPath = [];

	for (let index = 0; index < coordinates.bus[busNumber].lat.length; index++) {
		busPath.push({lat: coordinates.bus[busNumber].lat[index],lng: coordinates.bus[busNumber].lng[index]});
	}

	/* DEbug 
	console.log(busPath);*/
	
	PathObject = new google.maps.Polyline({
		path: busPath,
		geodesic: true,
		strokeColor: '#000000',
		strokeOpacity: 1.0,
		strokeWeight: 1
	});

	PathObject.setMap(map);

	coordinates.path.push(PathObject);

}

function RemovePath() {

	/* Only removes if there is some path data */
	if (coordinates.path.length > 0) {

		for(let i = 0; i < coordinates.path.length; i++) {
			coordinates.path[i].setMap(null);
			coordinates.path.shift();
		}

	}
}

function ShowPath() {

	if (coordinates.path.length > 0) {

		for(let i = 0; i < coordinates.path.length; i++) {
			coordinates.path[i].setMap(map);
		}

	}

}

function DontShowPath() {

	if (coordinates.path.length > 0) {

		for(let i = 0; i < coordinates.path.length; i++) {
			coordinates.path[i].setMap(null);
		}

	}
}

function CleanTextValues() {
	window.document.getElementById("lat-text").innerHTML = "";
	window.document.getElementById("lng-text").innerHTML = "";
	window.document.getElementById("distance-text").innerHTML = "";
	window.document.getElementById("velocity-text").innerHTML = "";
	window.document.getElementById("totalDist").innerHTML = "";
	window.document.getElementById("endSimu-text").innerHTML = "";
}

function CreateIconObject (busNumber) {

	/* Better option is to create an object and atributte the marker to a BUS object */
	coordinates.bus[busNumber].icon = new google.maps.Marker({
		position: {lat: coordinates.bus[busNumber].lat[0], lng: coordinates.bus[busNumber].lng[0]},
		map: map,
		draggable: false,
		clickable: true,
		icon: 'http://findicons.com/files/icons/1496/world_of_copland_2/32/school_bus.png',
	});

	attachMessage(coordinates.bus[busNumber].icon, busNumber);

}

function attachMessage(marker, busNumber) {

	coordinates.bus[busNumber].infoWindow = new google.maps.InfoWindow({
	  content: 	"Bus: " + busNumber 
	});

	marker.addListener('click', function() {
		coordinates.bus[busNumber].infoWindow.open(marker.get('map'), marker);
	});

}

function UpdateInfoWindow(busNumber, lat, lng, distance, velocity) {

	/* ToFixed() requires a value */
	if (typeof distance == "undefined" || typeof velocity == "undefined") {
		distance = 0;
		velocity = 0;
	}
		
	var contentString = "<b>Bus: </b>" + busNumber + "<br>" 
	+ "Lat: " + lat + "<br>"
	+ "Lng: " + lng + "<br>"
	+ "Distance: " + distance.toFixed(2) + " (m) <br>"
	+ "Velocity: " + velocity.toFixed(2) + " (km/h) <br>"

	coordinates.bus[busNumber].infoWindow.setContent(contentString);

}
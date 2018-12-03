// Note: This example requires that you consent to location sharing when
// prompted by your browser. If you see the error "The Geolocation service
// failed.", it means you probably did not give permission for the browser to
// locate you.
var map, infoWindow, marker;
var poly;
var distance=0;
var prevLatLng=null;

function initMap() {

  var myOptions = {
    zoom: 19,
    center: {lat: 37.382593, lng: 126.671132},
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  };

  map = new google.maps.Map(document.getElementById('map'), myOptions);

  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      marker = new google.maps.Marker({
        position: pos, 
        map: map,
        animation:google.maps.Animation.BOUNCE,
      });
      map.setCenter(pos);

      poly = new google.maps.Polyline({
        strokeColor: '#b1dd90',
        strokeOpacity: 1.0,
        strokeWeight: 10
      });
      poly.setMap(map);

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.<br>Turn on GPS then reload.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

var id;
var v;

function followUser() {
  var options;


  function success(pos) {
    var crd = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };
    marker.setPosition(crd);
    map.setCenter(crd);

    myLatLng = new google.maps.LatLng(crd); 

    var path = poly.getPath();

    path.push(myLatLng);

    if(prevLatLng != null)
      distance = distance + google.maps.geometry.spherical.computeDistanceBetween(myLatLng, prevLatLng);

    if (distance < 1000)
      document.getElementById("distance").innerHTML=Math.floor(distance)+" m";
    else
      document.getElementById("distance").innerHTML=Math.floor(distance/10)/100+" km";
    prevLatLng = myLatLng;

    ////Speed
    /*
    var lastTimestamp;
    var speedX = 0, speedY = 0, speedZ = 0;
    window.addEventListener('devicemotion', function(event) {
      var currentTime = new Date().getTime();
        if (lastTimestamp === undefined) {
          lastTimestamp = new Date().getTime();
          return; //ignore first call, we need a reference time
        }
      //  m/s² / 1000 * (miliseconds - miliseconds)/1000 /3600 => km/h (if I didn't made a mistake)
      speedX += event.acceleration.x / 1000 * ((currentTime - lastTimestamp)/1000)/3600;
      //... same for Y and Z
      document.getElementById("speed").innerHTML=speedX;
      lastTimestamp = currentTime;
    }, false);
    */

    
  }

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  }

  options = {
    enableHighAccuracy: true,
    maximumAge: 0
  };
  
  id = navigator.geolocation.watchPosition(success, error, options);
  

  var preLoc = null;
  var sdis = 0;
  function checkSpeed(pos){
    var position = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };

    var curLoc = new google.maps.LatLng(position);

    if(preLoc != null)
    {
      sdis = google.maps.geometry.spherical.computeDistanceBetween(curLoc, preLoc);
      sdis = (sdis*2).toFixed(1);
      document.getElementById("speed").innerHTML=sdis +" m/s";
    }

    preLoc = curLoc;
  }

  function incr(){
    navigator.geolocation.getCurrentPosition(checkSpeed, error, options);
  }
  
  v = setInterval(incr, 500);
}

////Timer
////
////

var timestring = document.getElementById('timer'),
      start = document.getElementById('startButton'),
      seconds = 0, minutes = 0,
      t;

function add() {
  seconds++;
  if (seconds >= 60) {
      seconds = 0;
      minutes++;
      if (minutes >= 60) {
          minutes = 0;
          hours++;
      }
  }
  timestring.textContent = (minutes ? (minutes > 9 ? minutes : minutes) : "0") + "m " + (seconds > 9 ? seconds : seconds)+"s";
}
function timer() {
  t = setInterval(add, 1000);
}

start.onclick = startPause;

var start = true;
function startPause() {
  if (start===true)
  {
    timer();
    followUser();
    document.getElementById("startButton").innerHTML="Pause";
    start = false;
  }
  else{
    clearTimeout(t);
    navigator.geolocation.clearWatch(id);
    document.getElementById("startButton").innerHTML="Start";
    clearInterval(v);
    start = true;
  }
}
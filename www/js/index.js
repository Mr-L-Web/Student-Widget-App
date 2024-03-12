/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

var controller;
var orderID;

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
	controller = new megamaxSale();
}
// Class containing the MegaMax model
function megamaxSale(){
	
	
	//Map display and UI
	var platform = new H.service.Platform({
        	apikey: "fiU_0DsRUcaNOXKI0LotmjfU3jJyTY8ZL3OU94JFjZk",
   	 });

	var defaultLayers = platform.createDefaultLayers();
	var map = new H.Map(
        document.getElementById("mapContainer"),
        defaultLayers.vector.normal.map,
        {
            zoom: 15,
            center: { lat: 52.5, lng: 13.4 },
        }
    );
	var ui = H.ui.UI.createDefault(map, defaultLayers);
    	var mapSettings = ui.getControl("mapsettings");
    	var zoom = ui.getControl("zoom");
   	var scalebar = ui.getControl("scalebar");
    	mapSettings.setAlignment("top-left");
    	zoom.setAlignment("top-left");
    	scalebar.setAlignment("top-left");
    	// Enable the event system on the map instance:
    	var mapEvents = new H.mapevents.MapEvents(map);
    	// Instantiate the default behavior, providing the mapEvents object:
    	new H.mapevents.Behavior(mapEvents);
	var markers = [];

	//FR 2.1
	function centreMap() {

        	function onSuccess(position) {
           	 console.log("Obtained position", position);
           	 var point = {
                	lng: position.coords.longitude,
                	lat: position.coords.latitude,
            	};
           	 map.setCenter(point);
        }

        function onError(error) {
            console.error("Error calling getCurrentPosition", error);

            // Inform the user that an error occurred
            alert("Error obtaining location, please try again.");
        }

        // Note: This can take some time to callback or may never callback,
        //       if permissions are not set correctly on the phone/emulator/browser
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
        });
    	}


	//FR1.1
	function validateOUCU(){	
		var oucu = getInputValue("oucu", "user1");
		var start = oucu.charAt(0);
		var end = oucu.charAt(oucu.length-1);
		var validate;
		if(start.match(/[a-z]/i) && end.match(/[0-9]/i)){
			console.log("valid OUCU"); 
		}
		else {
			alert ("OUCU is not valid. It must start with a letter and end with a number");
		}
			
	}
	
	//FR1.2
	var widgetID = 1;
	function nextNav(){
		var oucu = getInputValue("oucu", "user1");
		var password = getInputValue("pass", "password");
		var url = "http://137.108.92.9/openstack/api/widgets/" + widgetID + "?OUCU=" + oucu + "&password=" + password;
		var onSuccess = function (data){
			if(widgetID <= 10){
				console.log("next image loading");
				widgetID = widgetID + 1;
				document.getElementById('widgetImage').src = data.data[0].url;
				document.getElementById('agree').value = data.data[0].pence_price;
				document.getElementById('widgetDescription').textContent = data.data[0].description;
			}
		
		}
	$.ajax(url, { type: "GET", data: {}, success: onSuccess });
	}	

	function prevNav(){
		var oucu = getInputValue("oucu", "user1");
		var password = getInputValue("pass", "password");
		var url = "http://137.108.92.9/openstack/api/widgets/" + widgetID + "?OUCU=" + oucu + "&password=" + password;
		var onSuccess = function (data){
			if(widgetID >= 1){
				console.log("previous image loading");
				widgetID = widgetID - 1;
				document.getElementById('widgetImage').src = data.data[0].url;
				document.getElementById('agree').value = data.data[0].pence_price;
				document.getElementById('widgetDescription').textContent = data.data[0].description;
				
			}
		
		}
	$.ajax(url, { type: "GET", data: {}, success: onSuccess });	
	}
	
	//FR1.5 & FR2.2
	
	function beginOrder(){
		var oucu = getInputValue("oucu", "user1");
		var password = getInputValue("pass", "password");
		var clientID = getInputValue("client", "1");
		var amount = getInputValue("amount", "1");
		var lon;
		var lat;
		var marker;
		var icon = new H.map.DomIcon("<div>&#x1F4CD</div>");
		var widgetPr = document.getElementById("agree").value * amount;
		function onSuccess(position) {
            		console.log("Obtained position", position);
			lon = position.coords.longitude;
			lat = position.coords.latitude;
            		var point = {
                		lng: lon,
                		lat: lat,
            			};
            		if (marker) {
                		// Remove marker if it already exists
                		map.removeObject(marker);
           			 }
			map.setCenter(point);
			marker = new H.map.DomMarker(point, { icon: icon });
			markers.push(marker);
			map.addObject(marker);
            			
		}
		function onError (error) {
            		console.error("Error calling getCurrentPosition", error);
       			 }

		function orderPOST_onSuccess(obj){
			console.log("request: received obj", obj);
			if (obj.status == "success") {
                		alert("Order has successfully begun. Please add widget to order");
				orderID = obj.data[0].id;
            		} else if (obj.message) {
                		alert(obj.message);
           		 } else {
                		alert("Invalid order ");
            		}
		}


		
		navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            		enableHighAccuracy: true,
        	});
		var order_url = "http://137.108.92.9/openstack/api/orders";
		$.ajax(order_url, { type: "POST", data: {OUCU: oucu, password: password, client_id: clientID, lattitude: lat, longitude: lon }, success: orderPOST_onSuccess });
	}

	//FR1.3
	
	function addToOrder(){
		var oucu = getInputValue("oucu", "user1");
		var password = getInputValue("pass", "password");
		var amount = getInputValue("amount", "1");
		var url = "http://137.108.92.9/openstack/api/order_items/?OUCU=" + oucu + "&password=" + password + "&order_id=" + orderID;
		var widgetPr = document.getElementById("agree").value * amount;

		function onSuccess(obj){
			console.log("request: received obj", obj);
			if (obj.status == "success") {
                		alert("Order has been successfully added.");
           		 } else if (obj.message) {
                		alert(obj.message);
            		} else {
                		alert("Invalid order ");
            		}
		}
		$.ajax(url, { type: "POST", data: {OUCU: oucu, password: password, order_id: orderID, widget_id: widgetID, number: amount,  pence_price: widgetPr}, success: onSuccess });
	};

	//FR1.4
	function displayTotal(){
		var oucu = getInputValue("oucu", "user1");
		var password = getInputValue("pass", "password");
		var client = getInputValue("client", "1");
		var item_url = "http://137.108.92.9/openstack/api/order_items/?OUCU=" + oucu + "&password=" + password + "&order_id=" + orderID;
		var client_url= "http://137.108.92.9/openstack/api/clients/" + client + "?OUCU=" + oucu + "&password=" + password;	
		var order_url = "http://137.108.92.9/openstack/api/orders/" + orderID + "?OUCU=" + oucu + "&password=" + password;		

		var client_onSuccess = function (data) {
			console.log("aquiring client data");
			document.getElementById('name').textContent = data.data[0].name;
			document.getElementById('address').textContent = data.data[0].address;
		}

		var order_onSuccess = function(data) {
			console.log("aquiring order date");
			document.getElementById('date').textContent = data.data[0].date;
		}



		var item_onSuccess = function (data) {
			console.log("displaying total");
			var total = 0;
			var VAT;
			data.data.forEach(addTotal);
			function addTotal(item, index){
				 var pence = parseInt(item.pence_price);
				 total = total + pence;
				 VAT = 0.2 * total;
				}
			document.getElementById('subtotal').textContent = total / 100;
			var totalVAT = (total + VAT) / 100;
			var totalRound = Math.round(totalVAT * 100) / 100;
			document.getElementById('total').textContent = totalRound;
		}


	$.ajax(item_url, { type: "GET", data: {}, success: item_onSuccess });
	$.ajax(client_url, { type: "GET", data: {}, success: client_onSuccess });
	$.ajax(order_url, { type: "GET", data: {}, success: order_onSuccess });
	}
	
	
	




	centreMap();

	//Controller functions


	this.beginOrder = function(){
		validateOUCU();
		beginOrder();
	};

	this.nextNav = function(){
		validateOUCU();
		nextNav();
	};

	this.prevNav = function(){
		validateOUCU();
		prevNav();
	};

	this.addToOrder = function(){
		validateOUCU();
		addToOrder();
		displayTotal();
	};


		

}


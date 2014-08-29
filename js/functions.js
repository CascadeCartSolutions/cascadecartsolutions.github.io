google.load('visualization', '1.0', {'packages': ['corechart']});
google.setOnLoadCallback(getCartLogicStatsByStatus);


function getCartLogicStatsByStatus() {
    var stats = {open: 0, completed: 0, unsuccessful: 0};
    var total_records = 0;
    var chart_data = new google.visualization.DataTable();

    $.ajax({
                type: 'GET',
                url: "http://stage1.gocartlogic.com/api/2/ticket/stats?report_on=status&format=json",
                dataType: 'json',
                success: function (data) {
                    //#TODO loop through data to overall stats
                    $.each(data, function (index, obj) {
                        total_records = total_records + obj.value;
                        switch (obj.service_status) {
                            case "OPEN":
                                stats.open = obj.value;
                                break;
                            case "COMPLETED":
                                console.log(obj.service_status);
                                stats.completed = obj.value;
                                break;
                            case "UNSUCCESSFUL":
                                stats.unsuccessful = obj.value;
                                break;
                            default:
                                break;
                        }
                      });

                 //   chart_data.addColumn('string', 'Status');
                  //      chart_data.addColumn('number', 'Value');
                    var chart_data = google.visualization.arrayToDataTable(
                        [
                            ['Status', 'Value',  {role: 'style'}],
                            ['OPEN', stats.open, "green"],
                            ['COMPLETED', stats.completed, "green"],
                            ['UNSUCCESSFUL', stats.unsuccessful, "green"]
                        ]);

                        var options = {'title': 'Total Cart Services Status',
                            'width': 475,
                            'height': 300,
                            'legend': 'none'
                        };

                        var chart = new google.visualization.BarChart(document.getElementById('total_stats'));
                        chart.draw(chart_data, options);



                },
                //Need to add Authorization Token to the call
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Token 18bcd8e461769609279c8d988723627c06479193");
                }
            }
    );


}


var base_tiles = L.tileLayer('http://{s}.tiles.mapbox.com/v3/cascadecontainer.idmmme3a/{z}/{x}/{y}.png', {
    attribution: 'By Joe Bennett &copy CartLogic-Cascade Engineering, Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
})

var route_completed_services = {};
var info = L.control();
var loading = L.control({position: 'topright'});
var legend = L.control({position: 'bottomright'});

function getColor(count) {
    return count >= 100 ? '#238b45' :
                    count >= 75 ? '#74c476' :
                    count >= 50 ? '#bae4b3' :
                    count >= 25 ? '#edf8e9' :
            '#edf8e9';
}


legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 25, 50, 75, 100],
            labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML =
                '<i style="background:' + getColor(grades[i] + 1) + '" class="transition"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '%');
    }

    return div;
};


info.onAdd = function (map) {
    this.__div = L.DomUtil.create('div', 'info') //div with class 'info'
    this.update();
    return this.__div;
};

info.update = function (properties) {
    this.__div.innerHTML = '<h4>Delivery Area</h4>' + (properties ?
            '<b>' + properties.DISTAREA + '</b><br /><br />' + properties.COMPLETED.toFixed(0) + '% COMPLETE</h3>'
            : 'Hover over a Map to show % complete.');
};

loading.update = function () {
    this.__div.innerHTML = '<img src="img/ajax-loader.gif" style="{opacity: 0.2; filter: alpha(opacity=20);}"/>'
}

loading.onAdd = function (map) {
    this.__div = L.DomUtil.create('div', 'info') //div with class 'info'
    this.update();
    return this.__div;

};


// Main function for getting geojson and mapping services.
MapInfo = function () {
    var map;
    var route_layer;
    var cart_window = function (feature, layer) {
        var service_cart = feature.properties.serviced_cart == null ? "No Serial" : feature.properties.serviced_cart;
        layer.bindPopup("<b>STATUS:</b> <br />" + feature.properties.status + " <br /><b>Address:</b> <br />" + feature.properties.house_number + ' ' + feature.properties.street_name
                + "<br /><b>Cart:</b> <br />size: " + feature.properties.cart_size + '  type: ' + feature.properties.cart_type
                + '<br /><b>Serial </b> <br />' + service_cart);
    }
    var house_layer = L.geoJson(null,
            {pointToLayer: function (feature, latlng) {
                return  L.marker(latlng, service_style(feature));
            },
                onEachFeature: cart_window
            }
    );

    var service_tickets_layer = L.geoJson(null,
            {pointToLayer: function (feature, latlng) {
                return  L.marker(latlng, service_style(feature));
            },
                onEachFeature: cart_window
            }
    );

    function setComplete(feature) {

        $.each(route_completed_services, function (index, route) {
            if (route.status__route__route == feature.properties.DISTAREA) {
                feature.properties.COMPLETED = route.value;
            }
        });

        feature.properties.COMPLETED = (feature.properties.COMPLETED / feature.properties.adrs_count).toFixed(2) * 100;

    }

    var cartIcon = L.icon(
            {
                iconUrl: 'https://s3.amazonaws.com/cartlogic/img/cart_image.png',
                iconSize: [22, 33], // size of the icon
                iconAnchor: [16, 37],
                popupAnchor: [0, -28]
            }
    );

    var ticketIcon = L.icon(
            {
                iconUrl: 'img/map-flag.png',
                iconSize: [40, 40], // size of the icon
                iconAnchor: [16, 37],
                popupAnchor: [0, -28]
            }
    );


    function service_style(feature) {
        var icon = {};
        if (feature.properties.status == 'OPEN') {
            icon = ticketIcon;
        } else {
            icon = cartIcon;
        }
        return{
            icon: icon,
            color: "#000",
            iconAnchor: [16, 37],
            popupAnchor: [0, -28]

        }
    }

    function route_style(feature) {
        setComplete(feature);
        return {
            fillColor: getColor(feature.properties.COMPLETED),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.75
        };
    }


    //Call CarLogic ticket list for all tickets
    function GetServiceTickets(min_lat_lon, max_lat_lon) {

        //#TODO call with bounding box parameters
        $.ajax({
            type: 'GET',
            url: 'http://stage1.gocartlogic.com/api/2/ticket/list/?format=geo&page_size=1000',
            data: {'bounding_box': min_lat_lon[0] + "," + min_lat_lon[1] + "," + max_lat_lon[0] + "," + max_lat_lon[1] },
            success: function (data) {
                $(".info").hide();
                if (map.hasLayer(service_tickets_layer)) {
                    service_tickets_layer.clearLayers();
                } else {
                    service_tickets_layer.addTo(map);
                }
                service_tickets_layer.addData(data.results);
                loading.removeFrom(map);

                //  service_tickets_layer.setStyle();
            },
            //Need to add Authorization Token to the call
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Token 18bcd8e461769609279c8d988723627c06479193");
            }

        });

    };


    //Get map geojson file.
    $.getJSON($('link[rel="points"]').attr("href"), function (data) {

        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });

        };


        function zoomToFeature(e) {
            map.fitBounds(e.target.getBounds());
        }

        function resetHighlight(e) {
            //#TODO fix this ... calling reset adds to completed
            route_layer.resetStyle(e.target);
            info.update();
        }

        function highlightFeature(e) {
            //Highlights on hover over
            var layer = e.target;

            info.update(layer.feature.properties);

            layer.setStyle({
                weight: 3,
                color: '#ccc',
                dashArray: '',
                fillOpacity: 0.3
//                className: 'transition'
            });
            //Wont work in IE or Opera
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
        }


        route_layer = L.geoJson(data, {
            style: route_style,
            onEachFeature: onEachFeature

        });

        map = L.map('map').fitBounds(route_layer.getBounds());
        base_tiles.addTo(map);
        route_layer.addTo(map);
        info.addTo(map);
        legend.addTo(map);


        map.on('moveend', function () {
            if (map.getZoom() >= 18) {

                //#TODO declare layer earlier and just remove plus add new data as need like the below sample

                map.removeLayer(route_layer);
                loading.addTo(map);
                $("#legend").fadeOut();

                //North East Coords of the map
                var max_lat_lon = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
                //South West Coords of the map
                var min_lat_lon = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
                GetServiceTickets(min_lat_lon, max_lat_lon);

            } else {
                //need to add the route layer back in
                route_layer.addTo(map);
                $(".legend").fadeIn();
                $(".info").fadeIn();

                //remove the service_ticket layer if its there
                if (map.hasLayer(service_tickets_layer)) {
                    service_tickets_layer.clearLayers()

                }
            }
        })
    });


    $("#address").autocomplete({
        source: function (request, response) {
            $("#service_info").html("").hide();
            var data = {};
            var address = request.term.split(" ");
            if (address.length > 1) {
                data.street_name = address[1];
            }
            data.house_number = address[0];
            $.ajax({
                url: "http://stage1.gocartlogic.com/api/2/ticket/list/?format=geo",
                dataType: "json",
                data: data,
                success: function (data) {
                    if (data.results.length > 0) {
                        $("#address_fill").val(data.results[0].location);
                        var address_array = [];
                        for (var i = 0; i < data.results.length; i++) {
                            // jquery auto complete
                            var address = data.results[i].properties.house_number + " " +
                                    data.results[i].properties.street_name;
                            data.results[i].value = address;
                            data.results[i].label = address;
                        }
                        response(data.results);
                    }


                },
                //Need to add Authorization Token to the call
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Token 18bcd8e461769609279c8d988723627c06479193");
                }
            });
        },

        //"http://stage1.gocartlogic.com/api/2/cart/list/?format=json",
        minLength: 2,
        select: function (event, obj) {
            // console.log(event);
            if (map.hasLayer(house_layer)) {
                house_layer.clearLayers();
            } else {
                house_layer.addTo(map);
            }
            house_layer.addData(obj.item);
            house_layer.openPopup();
            if (obj.item.properties.status == "OPEN") {
                $("#service_info").html("<h4> Cart delivery status is <i>OPEN</i><span class='glyphicon glyphicon-flag'>  </span></h4>" +
                        "<br>Cart or carts have not been delivered").show()
            } else {
                $("#service_info").html("<h4> Cart Delivery status is <i>" + obj.item.properties.status + "</i><span class='glyphicon glyphicon-trash'>  </span></h4>" +
                        "<br><b>Cart serial number: </b> " + obj.item.properties.serviced_cart + ", <b>Type: </b>" + obj.item.properties.cart_type + ", <b>Size: </b>" + obj.item.properties.serviced_cart).show()
            }
            map.setView([obj.item.geometry.coordinates[1], obj.item.geometry.coordinates[0]], 18);

        },
        autoFocus: true
    });


};


//Call CartLogic ticket stats get completed by route totals
getCartLogicStatsByRoute = function () {

    $.ajax({
                type: 'GET',
                url: "http://stage1.gocartlogic.com/api/2/ticket/stats?status=COMPLETED&report_on=route&format=json",
                dataType: 'json',
                success: function (data) {
                    route_completed_services = data;
                    MapInfo();
                },
                //Need to add Authorization Token to the call
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Token 18bcd8e461769609279c8d988723627c06479193");
                }
            }
    );

    return route_completed_services;

};

getCartLogicStatsByRoute();
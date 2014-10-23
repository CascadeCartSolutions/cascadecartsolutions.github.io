/**
 * Created by andytus on 9/25/14.
 */
var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("?");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    	// If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
    	// If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
    	// If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  }
    return query_string;
} ();


(function(){
var app = angular.module('Charting', []);


app.controller('getDonut', function(){
//Gets data for the donut chart
var burnUp =0;
    var site_id = QueryString.site;
    var response = $.ajax({url:'http://' + site_id + '.gocartlogic.com/api/2/ticket/stats?report_on=status&format=json'});
    var ticketPromise = [ ];
    response.type = "GET";
    response.dataType = "json";
    response.success(function(data, status, headers, config){
        ticketPromise = data;
          burnUp = ticketPromise[0]["value"] + ticketPromise[1]["value"] + ticketPromise[2]["value"];

        new Morris.Donut({
        element: 'ticketsdonut',
        data:[
              {label: ticketPromise[0]["service_status"], value: ticketPromise[0]["value"]},
              {label: ticketPromise[1]["service_status"], value: ticketPromise[1]["value"]},
              {label: ticketPromise[2]["service_status"], value: ticketPromise[2]["value"]}
           ],
        colors: ['#f26649',//red
                 '#0079c1',//blue
                 '#7ac143'//green

        ]

        });

    });
    response.error(function(data, status, headers, config){
        alert("failed to get chart data!");
        console.log("failed to get chart data. "+ status)
    });
//fills bar graph
    var response1= $.ajax('http://' + site_id + '.gocartlogic.com/api/2/ticket/stats?report_on=date_completed&days=14&format=json');

    response1.success(function(data, status, headers, config){
//14 days Completed tickets line Graph.
        new Morris.Line({
        // ID of the element in which to draw the chart.
        element: 'ticketsbyday',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: data,
        lineColors:['#7ac143'],
        // The name of the data record attribute that contains x-values.
        xkey: 'date',
        xLabels: 'date',
        // A list of names of data record attributes that contain y-values.
        ykeys: ['value'],
        // Labels for the ykeys -- will be displayed when you hover over the
        // chart.
        labels: ['Completed']
        });

    });
    response1.error(function(data, status, headers, config){
        alert("failed to get chart data!");
        console.log("failed to get chart data.")
    });

     var response2= $.ajax('http://' + site_id + '.gocartlogic.com/api/2/ticket/stats?report_on=date_completed&days=100&format=json');

    response2.success(function(data, status, headers, config){

//Adds ticket Count.
      //1 second delay for adding  burnup chart due to chart loading faster then the ymax:burnup variable
        setTimeout(function(){
        var final = [ ];
        var count = 0;
        var openCount = burnUp;
        for(var d = 0;d < data.length; d++){
          count = count + data[d]["value"];

            final.push({date: data[d]['date'], value:count})

        }


        //burn up chart
          new Morris.Area({
          // ID of the element in which to draw the chart.
          element: 'burnup',
          behaveLikeLine: true,
          // Chart data records -- each entry in this array corresponds to a point on
          // the chart.
          data: final,
          lineColors:['#7ac143'],
          // The name of the data record attribute that contains x-values.
          xkey: 'date',
          xLabels: 'date',
          // A list of names of data record attributes that contain y-values.
          ykeys: ['value'],
          //max value of y
          ymax: burnUp,
          // Labels for the ykeys -- will be displayed when you hover over the
          // chart.
          labels: ['Completed']
          });
        },1000);

    });
    response2.error(function(data, status, headers, config){
        alert("failed to get chart data!");
        console.log("failed to get chart data.")
    });
});
})();



var items;
$(document).ready(function() {

    $("#address").autocomplete({

        source: function (request, response) {
            $("#service_info").html("").hide();
            var data = {};
            var address = request.term.split(" ");
            if (address.length > 1) {
                data.street_name = address[1];
            }
            data.house_number = address[0];

            var site_id = QueryString.site;

            $.ajax({
                url: 'http://' + site_id +'.gocartlogic.com/api/2/ticket/list/?format=geo',
                dataType: "json",
                data: data,
                type: "GET",
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

                beforeSend: function (xdr) {
                    xdr.setRequestHeader("Authorization", "Token c677850e73935e91cd2d41ed646cd58bc571053b");
                }
            });
        },


        minLength: 2,
        select: function (event, obj) {

            if (obj.item.properties.status == "OPEN") {
                $("#service_info").html("<h4> Cart delivery status is <i style='color: #0079c1'>OPEN </i><span class='glyphicon glyphicon-flag'>  </span></h4>" +
                    "<br>Cart or carts have not been delivered").show()
            } else if (obj.item.properties.status == "COMPLETED") {
                $("#service_info").html("<h4> Cart Delivery status is <i style='color: #7ac143'>" + obj.item.properties.status + "</i> <span class='glyphicon glyphicon-trash'>  </span></h4>" +
                    "<br><b>Cart serial number: </b> " + obj.item.properties.serviced_cart + ", <b>Type: </b>" + obj.item.properties.cart_type + ", <b>Size: </b>" + obj.item.properties.cart_size +
                    ", <b>Date Completed: </b> " + obj.item.properties.date_completed).show()
            } else {
                $("#service_info").html("<h4> Cart Delivery status is <i style='color: #f26649'>" + obj.item.properties.status + "</i> <span class='glyphicon glyphicon-trash'>  </span></h4>" +
                    "<br><b>Type: </b>" + obj.item.properties.cart_type + ", <b>Size: </b>" + obj.item.properties.cart_size).show()
            }


        },
        autoFocus: true
    });
});
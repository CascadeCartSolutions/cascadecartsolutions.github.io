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

    var site_id = QueryString.site;
    var response = $.ajax({url:'http://' + site_id + '.gocartlogic.com/api/2/ticket/stats?report_on=status&format=json'});
    var ticketPromise = [ ];
    response.type = "GET";
    response.dataType = "json";
    response.success(function(data, status, headers, config){
        ticketPromise = data;
        new Morris.Donut({
        element: 'ticketsdonut',
        data:[
              {label: ticketPromise[0]["service_status"], value: ticketPromise[0]["value"]},
              {label: ticketPromise[1]["service_status"], value: ticketPromise[1]["value"]},
              {label: ticketPromise[2]["service_status"], value: ticketPromise[2]["value"]}
           ],
        colors: ['#960811',
                 '#0404B0',
                 '#00701C'

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

    //console.log(data);
    //console.log(sortDatabyDay(data));
     //var semi = sortDatabyDay(data);
        //var final = [ ];
        //for(var d = 0;d < data.length; d++){
        // final.push({day: data[d][0], Completed:data[d][1]})

        //}
        //console.log(final);
        new Morris.Line({
        // ID of the element in which to draw the chart.
        element: 'ticketsbyday',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        /*data: [
            { day: '2014-02-12', Completed: 780, Unsuccessful:13},
            { day: '2014-02-13', Completed: 465, Unsuccessful:0},
            { day: '2014-02-14', Completed: 947, Unsuccessful:7},
            { day: '2014-02-15', Completed: 845, Unsuccessful:3},
            { day: '2014-02-16', Completed: 1236, Unsuccessful:26}
        ],*/
        data: data,
        lineColors:['#00701C'],
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
});
})();



var items;
$(document).ready(function() {
jQuery.support.cors = true;
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
            // console.log(event);

            if (obj.item.properties.status == "OPEN") {
                $("#service_info").html("<h4> Cart delivery status is <i>OPEN</i><span class='glyphicon glyphicon-flag'>  </span></h4>" +
                    "<br>Cart or carts have not been delivered").show()
            } else {
                $("#service_info").html("<h4> Cart Delivery status is <i>" + obj.item.properties.status + "</i> <span class='glyphicon glyphicon-trash'>  </span></h4>" +
                    "<br><b>Cart serial number: </b> " + obj.item.properties.serviced_cart + ", <b>Type: </b>" + obj.item.properties.cart_type + ", <b>Size: </b>" + obj.item.properties.cart_size).show()
            }


        },
        autoFocus: true
    });
});
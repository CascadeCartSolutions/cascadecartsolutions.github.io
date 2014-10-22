var QueryString = function () {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
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


String.prototype.replaceAll = function(search, replace)
{
    //if replace is null, return original string otherwise it will
    //replace search string with 'undefined'.
    if(!replace)
        return this;

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};


startLookup = function(){
    var ticket_id = QueryString.ticket_id;
    var site = QueryString.site;


    $.ajax({
                type: 'GET',
                url: "http://" + site + ".gocartlogic.com/api/2/ticket/detail/"  + ticket_id,
                dataType: 'json',
                success: function (data) {
                console.log(data.status);
                    date_last_attempted = new Date(data.date_last_attempted);
                    date_completed = new Date(data.date_completed);
                    console.log(data);
                    console.log(data.location);

                    if (data.status == "OPEN"){
                        $("#service_info").html("STATUS: <b>" + data.status + "</b><br> ADDRESS: <b>" + data.location.replaceAll("-", " "));
                    }else if(data.status == "COMPLETED"){
                        $("#service_info").html("STATUS: <b>" + data.status + "</b><br> ADDRESS: <b>" + data.location.replaceAll("-", " ") + "</b> COMPLETED ON" + date_completed.toLocaleDateString()  +"@"+ date_completed.toLocaleTimeString());
                    }else if(data.status == "UNSUCCESSFUL"){
                        $("#service_info").html("DELIVERY WAS <b><u>UNSUCCESSFUL</u></b> AT ADDRESS: <b>" + data.location.replaceAll("-", " ") + "</b> FOR THE FOLLOWING REASON: <b>" +  data.reason_codes + "</b> <br> LAST ATTEMPT: <b>" + date_last_attempted.toLocaleDateString() + "@" + date_last_attempted.toLocaleTimeString() +"</b>");
                    }

                },

               error: function(w,t,f){
                 console.log(w + "\n" + t + "\n" + f);
               },
                //Need to add Authorization Token to the call
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Token aad7330568b93df92e2097e9f89775c8c463abe7");
                }
            }
    );
};

startLookup();


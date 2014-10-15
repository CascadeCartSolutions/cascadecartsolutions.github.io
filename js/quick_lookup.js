function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

String.prototype.replaceAll = function(search, replace)
{
    //if replace is null, return original string otherwise it will
    //replace search string with 'undefined'.
    if(!replace)
        return this;

    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};


startLookup = function(){
    var ticket_id = getParameterByName('ticket');

    $.ajax({
                type: 'GET',
                url: "http://field1.gocartlogic.com/api/2/ticket/detail/"  + ticket_id,
                dataType: 'json',
                success: function (data) {
                console.log(data.status);
                    date_last_attempted = new Date(data.date_last_attempted);
                    date_completed = new Date(data.date_completed);

                    if (data.status == "OPEN"){
                        $("#service_info").html("STATUS: <b>" + data.status + "</b><br> ADDRESS: <b>" + data.location.replaceAll("-", " "));
                    }else if(data.status == "COMPLETED"){
                        $("#service_info").html("STATUS: <b>" + data.status + "</b><br> ADDRESS: <b>" + data.location.replaceAll("-", " ") + "</b> COMPLETED ON" + date_completed.toLocaleDateString()  +"@"+ date_completed.toLocaleTimeString());
                    }else if(data.status == "UNSUCCESSFUL"){
                        $("#service_info").html("DELIVERY WAS <b><u>UNSUCCESSFUL</u></b> AT ADDRESS: <b>" + data.location.replaceAll("-", " ") + "</b> FOR THE FOLLOWING REASON: <b>" +  data.reason_codes + "</b> <br> LAST ATTEMPT: <b>" + date_last_attempted.toLocaleDateString() + "@" + date_last_attempted.toLocaleTimeString() +"</b>");
                    }

                },
                //Need to add Authorization Token to the call
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Token aad7330568b93df92e2097e9f89775c8c463abe7");
                }
            }
    );
};

startLookup();


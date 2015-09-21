'use strict';

function formatTime(num){return (num <= 9)? ("0"+num) : num;}

function weekDay(){
    var d = new Date();
    var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
   return days[d.getDay()];
}

function monthWord(){
    var month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var d = new Date();
    return month[d.getMonth()];
}

exports.dateComplet = function(){ // return formate => 10:07:06
    var currDate = new Date();
    var dateCompletFormat = monthWord()+" "+formatTime(currDate.getDate())+" "+formatTime(currDate.getHours()) + ":" + formatTime(currDate.getMinutes()) + ":" + formatTime(currDate.getSeconds()) + " "+weekDay();
    return dateCompletFormat;
};
var chirperApp = {
    user: 'Huseyin',
    fireBaseUrl: '{firebaseurl}',
    selectedMsg: '',
    friendsArray:[]
}
chirperApp.CreateRequestConfig = function (verb,url,data,success,error) {
    this.verb = verb;
    this.url = url;
    this.data = data;
    this.error = error;
    this.success = success;
}

chirperApp.createRequest = function (config) {
    if (config.data) {

        $.ajax({
            url: config.url,
            method: config.verb,
            success: config.success,
            errorr:config.error,
            data:config.data
        });
    }

    else {
        $.ajax({
            url: config.url,
            method: config.verb,
            success: config.success,
            errorr: config.error
        });
    }

   
}

chirperApp.ListMessages = function (data) {

    if (data) {
        var list = JSON.parse(JSON.stringify(data));
        
        //console.log(data);
        var count = 0;

        for (m in list) {
            //console.log(list[m]);
            var message = list[m];
            message.id = m;
            chirperApp.addMessageToList(message);
            count++;
        }
        $('#messageCount').text(count);
    }
    else {
       // alert('Im Here, and data is : '+data);
      
    }
 
}

chirperApp.addNewMessage = function () {
    var input = $('#newTweetInput');
    var msg = new chirperApp.Message(input.val());
    var newTweet = new chirperApp.CreateRequestConfig('POST', chirperApp.fireBaseUrl + 'tweets.json'
        , JSON.stringify(msg), chirperApp.GetOneMessage, chirperApp.showError);
    chirperApp.createRequest(newTweet);
}

chirperApp.Message = function (message) {
    this.message = message;
    this.timestamp = $.format.date(new Date(), 'dd/MM/yyyy HH:mm:ss');
    this.user = chirperApp.user;
}

chirperApp.addMessageToList = function (msg) {
   
    var messageList = $('#messageList');
    var h = ' <div class="panel panel-primary" id="'+msg.id+'">';
    h += '<div class="panel-heading">';
    var ocd = 'onclick="chirperApp.deleteMessage(\'' + msg.id + '\')"';
    var ocu = 'onclick="chirperApp.updateMessage(\'' + msg.id + '\')"';
    h += '<button ' + ocu;
    h +=' class="btn btn-info btn-xs glyphicon glyphicon-edit  pull-right ">Update</button>';
    h += '<button ' + ocd;
    h +=' class="btn btn-danger  btn-xs glyphicon glyphicon-trash pull-right">Delete</button>';
    h += '<h3 class="panel-title">' + msg.timestamp + '</h3>';
    h += ' </div><div class="panel-body"><blockquote class="pull-right"><p>';
    h += msg.message + ' </p> <small>' + msg.user + '<cite>-</cite></small>';
    h += '</blockquote></div>';
   
    h += '</div>';
 
    messageList.prepend(h);
}


chirperApp.GetOneMessage = function (msg) {
   // console.log(msg);
    id = msg.name;
    //alert(id);
    var getTweet = new chirperApp.CreateRequestConfig('GET', chirperApp.fireBaseUrl +'tweets/'+id+'.json'
      , null, chirperApp.addMessageToList, chirperApp.showError);
    chirperApp.createRequest(getTweet);
    $('#newTweetInput').val('');
    var count = parseInt($('#messageCount').text());
    count += 1;
    $('#messageCount').text(count);
}



chirperApp.startApp = function () {

    var getTweets = new chirperApp.CreateRequestConfig('GET', chirperApp.fireBaseUrl + 'tweets.json'
        , null, chirperApp.ListMessages, chirperApp.showError);
    chirperApp.createRequest(getTweets);

    

    chirperApp.getListOfFriends();

    chirperApp.getTweetsFromFriends();

    chirperApp.getMyProfile();

   // chirperApp.startPooling();
   //setInterval(function () {
   // //    chirperApp.getListOfFriends();

   //   chirperApp.getTweetsFromFriends();
   // }, 2000);
};

chirperApp.getListOfFriends = function () {
    var getFriends = new chirperApp.CreateRequestConfig('GET', chirperApp.fireBaseUrl + 'friends.json'
        , null, chirperApp.ListFriends, chirperApp.showError);
    chirperApp.createRequest(getFriends);
}

chirperApp.deleteMessage = function (id) {
    if (confirm("Are you sure to delete?"))
    {
        this.selectedMsg = id;
        var delTweet = new chirperApp.CreateRequestConfig('DELETE', chirperApp.fireBaseUrl +
            'tweets/' + id + '.json'
     , null, chirperApp.showInfo, chirperApp.showError);
        chirperApp.createRequest(delTweet);
       
    }
}
chirperApp.showInfo = function () {
  
    $('#' + chirperApp.selectedMsg).hide(200);
    var count = parseInt($('#messageCount').text());
    count -= 1;
    $('#messageCount').text(count);
}

chirperApp.ListFriends = function (friends) {
   
    var response = JSON.parse(JSON.stringify(friends));
    //console.log(response);
    h = '';
    for (f in response) {
        var friendUrl = response[f];
        chirperApp.friendsArray.push(friendUrl);
        //console.log(friendUrl);
        var friend = new chirperApp.CreateRequestConfig('GET', friendUrl
       , null, chirperApp.addOneFriend, chirperApp.showError);
        chirperApp.createRequest(friend);
     
       // console.log(chirperApp.friendsArray.length);
    }
    $('#newFriendUrlInput').val('');
}

chirperApp.addOneFriend = function (friend) {
    // var u = JSON.parse(JSON.stringify(friend));
    $('#friendList').html('');
    for (f in friend) {
        myFriend = friend[f];
        h += ' <div class="col-md-4"><div class="thumbnail">';
        h += '<img alt="Hsueyin img" style="width:110px;height:140px;"';
        h += 'src="' + myFriend.photo + '"/> <div class="caption"><h3>';
        h += myFriend.name + '</h3><p> Living in ' + myFriend.location + '</p>';
        h += ' </div> </div>  </div>';
        $('#friendList').append(h);
    }
}

chirperApp.addNewFriend = function () {
    var input = $('#newFriendUrlInput');
    var url = input.val();
    var newFriend= new chirperApp.CreateRequestConfig('POST', chirperApp.fireBaseUrl + 'friends.json'
        , JSON.stringify(url), chirperApp.getListOfFriends, chirperApp.showError);
    chirperApp.createRequest(newFriend);
}

chirperApp.getTweetsFromFriends = function () {
  
    var list = chirperApp.friendsArray;
    if (list.length < 1) {
       
        var friend = new chirperApp.CreateRequestConfig('GET', this.fireBaseUrl + '/friends.json'
     , null, chirperApp.getTweetsFromFriends, chirperApp.showError);
        chirperApp.createRequest(friend);

    }
    else {
       
        var messageList = $('#timeLineTweets');
         messageList.empty();
        for (var i = 0; i < chirperApp.friendsArray.length; i++) {
           // alert('in tweets : ' + chirperApp.friendsArray.length);
            var url = chirperApp.friendsArray[i].replace('profile.json','');
          
            var getTweets = new chirperApp.CreateRequestConfig('GET', url + '/tweets.json'
           , null, chirperApp.ListMessagesFromFriends, chirperApp.showError);
            chirperApp.createRequest(getTweets);
        }
    }
    
}

chirperApp.ListMessagesFromFriends = function (response) {
    
    tweets = JSON.parse(JSON.stringify(response));
   // alert(response);
    var messageList = $('#timeLineTweets');
   // messageList.html('');
    for (m in tweets) {

        var msg = tweets[m];
        var h = ' <div class="panel panel-primary" id="' + msg.id + '">';
        h += '<div class="panel-heading">';
      
        h += '<h3 class="panel-title">' + $.format.date(msg.timestamp, 'dd/MM/yyyy HH:mm:ss') + '</h3>';
        h += ' </div><div class="panel-body"><blockquote class="pull-right"><p>';
        h += msg.message + ' </p> <small>' + msg.user + '<cite>-</cite></small>';
        h += '</blockquote></div>';

        h += '</div>';

        messageList.prepend(h);

    }
}

chirperApp.updateMessage = function (id) {

   
    var info = $('#updateTitleInfoLbl');
    info.text(' ' + id + ' }');
    
    var inputMessage = $('#updateMessageInput');
    
    $('#updateModal').modal('show');

}

chirperApp.updateMyProfile = function () {

    var name = $('#updateMyNameInput');
    var location = $('#updateMyLocationInput');
    var img = $('#updateMyImageInput');

    var data = {
        name: name.val(),
        location: location.val(),
        photo: img.val()
    };

    var update = new chirperApp.CreateRequestConfig('PUT', this.fireBaseUrl + 'profile/-JcvQyXdGaWxyV3u-ME4.json'
   ,JSON.stringify(data), chirperApp.getMyProfile, chirperApp.showError);
    chirperApp.createRequest(update);
};

chirperApp.getMyProfile = function (profile) {
    var img = $('#myProfileImg');
    var name = $('#myProfileName');
    var location = $('#myProfileLiving');

    if (profile) {
        var prof = JSON.parse(JSON.stringify(profile));
        img.attr('src',prof.photo);
        name.text(prof.name);
        location.text(prof.location);
        $('#updateProfileModal').modal('hide');
    }
    else {
        var get = new chirperApp.CreateRequestConfig('GET', this.fireBaseUrl + 'profile/-JcvQyXdGaWxyV3u-ME4.json'
  , null, chirperApp.getMyProfile, chirperApp.showError);
        chirperApp.createRequest(get);
    }
}

//chirperApp.startPooling = function () {
//    setInterval(function () {
//        chirperApp.getTweetsFromFriends();
//    },1000)
//}

///https://chirperlouism.firebaseio.com/profile.json
//https://chirperjim.firebaseio.com/profile.json

chirperApp.showError = function (data) {
    alert(data);
}

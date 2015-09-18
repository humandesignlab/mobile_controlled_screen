$(function() {
    "use strict";
    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    var thmb1 = document.getElementById('thmb1');
    var postAdButton = document.getElementById('postAdButton');
    var userName = null;
    var id = null;
    var json = null;
    var fb_button = document.getElementById('fb-button');
    var thankyou = document.getElementById('thankyou');
    var wrap = document.getElementById('wrap');
    
        var toggleFirstUser = function(user) {
	    if (user === 'first user') {
		    wrap.style.display = 'block';
			thankyou.style.display = 'none';
	    } else {
		    wrap.style.display = 'none';
            thankyou.style.display = 'block';
            TweenLite.to(thankyou, 1, {
                top: 0,
                ease: Back.easeOut
            });
	    }
	    
    }
    
    //facebook connect
    // This is called with the results from from FB.getLoginStatus().

    function statusChangeCallback(response) {
        console.log('statusChangeCallback');
        console.log(response);
        // The response object is returned with a status field that lets the
        // app know the current login status of the person.
        // Full docs on the response object can be found in the documentation
        // for FB.getLoginStatus().
        var uri = encodeURI('http://humandesignlab.com/sitios/hp/websocket_server_app_save_pic_to_server/mobile_client.html');
        if (response.status === 'connected') {
            //Logged into your app and Facebook.
            testAPI();
            fb_button.style.display = 'none';
        } else if (response.status === 'not_authorized') {
            // The person is logged into Facebook, but not your app.
            document.getElementById('status').innerHTML = 'Please log ' + 'into this app.';
        } else {
            // The person is not logged into Facebook, so we're not sure if
            // they are logged into this app or not.
            window.location = encodeURI("https://www.facebook.com/dialog/oauth?client_id=615972365201956&redirect_uri=" + uri + "&response_type=token");
            document.getElementById('status').innerHTML = 'Please log ' + 'into Facebook.';
        }
    }

    window.fbAsyncInit = function() {
        FB.init({
            appId: '615972365201956',
            cookie: true,
            // enable cookies to allow the server to access 
            // the session
            xfbml: true,
            // parse social plugins on this page
            frictionlessRequests: true,
            oauth: true,
            version: 'v2.2' // use version 2.2
        });

        // Now that we've initialized the JavaScript SDK, we call 
        // FB.getLoginStatus().  This function gets the state of the
        // person visiting this page and can return one of three states to
        // the callback you provide.  They can be:
        //
        // 1. Logged into your app ('connected')
        // 2. Logged into Facebook, but not your app ('not_authorized')
        // 3. Not logged into Facebook and can't tell if they are logged into
        //    your app or not.
        //
        // These three cases are handled in the callback function.
        //             FB.login(function(response) {
        //                 statusChangeCallback(response);
        //             });
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
        });
    };

    // Load the SDK asynchronously
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
    // Here we run a very simple test of the Graph API after login is
    // successful.  See statusChangeCallback() for when this call is made.

    function testAPI() {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me?fields=name,picture,id', function(response) {
            console.log('Successful login for: ' + response.name);
            document.getElementById('status').innerHTML = '<img src="' + response.picture.data.url + '"> <h3>Bienvenido, ' + response.name + '.<br> ¿Estás listo para romper las reglas?</h3>';
            userName = response.name + ' ' + response.id;
            id = response.id;
            console.log('My Facebook ID: ' + id);
        });
        postAdButton.addEventListener("click", function() {
            connection.send('saveMyAd');
            var result = null;
            var scriptUrl = "inc/newestFile.php";
            setTimeout(function() {
                $.ajax({
                    url: scriptUrl,
                    type: 'get',
                    dataType: 'html',
                    async: true,
                    success: function(data) {
                        result = data;
                        //alert('Got this result from newestFile.php : ' + result);
                        //postMyAd(result);
                    }
                });
            }, 10000);
            alert('¡Tu anuncio ha sido publicado!');
            toggleFirstUser('not');
//             wrap.style.display = 'none';
//             thankyou.style.display = 'block';
//             TweenLite.to(thankyou, 1, {
//                 top: 0,
//                 ease: Back.easeOut
//             });
            connection.onclose = function() {};
            connection.close();
            TweenLite.from(this, 1, {
                opacity: 0
            });
            TweenLite.to(this, 1, {
                opacity: 1
            });
        });

        function trim1(str) {
            return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        }

        var postMyAd = function(theFileName) {
            var filename = trim1(theFileName);
            var params = {};
            params['message'] = '#ROMPELASREGLAS con la HP Pavilion x360 y participa para ganar un viaje a un reconocido festival de música en Chicago.';
            params['name'] = '#ROMPELASREGLAS';
            params['link'] = 'http://www.hp.com';
            params['description'] = '¡Da click aquí aquí para ir al sitio y regístrate para participar!';
            params['picture'] = 'http://humandesignlab.com/sitios/hp/websocket_server_app_save_pic_to_server/generated_images/' + filename;
            //				alert('...and this theFileName from the click : ' + params.picture);
            //              params['picture'] = 'http://localhost:8000/generated_images/' + filename;
            //              setTimeout( function() {$.ajax({
            //                  url: 'generated_images/' + filename,
            //                  success: function(data){
            //                      alert('exists');
            //                  },
            //                  error: function () {
            //                      alert('does not exists');
            //                  },  
            //              });
            //              }, 5000);               
            FB.api('/me/feed', 'post', params, function(response) {
                if (!response || response.error) {
                    // an error occured
                    alert(JSON.stringify(response.error));
                } else {
                    // Done
                    //alert('Published to stream: ' + params.picture);
                    //console.log('Published to stream: ' + params.picture);
                }
            });
        };
    }

    //end of facebook connect
    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;
    


    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        content.html($('<p>', {
            text: 'Sorry, but your browser doesn\'t ' + 'support WebSockets.'
        }));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    var localServer = 'ws://127.0.0.1:1337';
    var scalingoServer = 'ws://fb-app-websocket-server.scalingo.io';
    var connection = new WebSocket(scalingoServer);
    connection.onopen = function() {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Send Message:');
    };

    connection.onerror = function(error) {
        // just in there were some problems with conenction...
        content.html($('<p>', {
            text: 'Sorry, but there\'s some problem with your ' + 'connection or the server is down.'
        }));
    };

    // most important part - incoming messages
    connection.onmessage = function(message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
        //TO DO: Disable messages for every element in the connectedUsers array, except for 0 index (the first element)
        if (json.data.connectedUsers[0] !== id) {
            var index = json.data.connectedUsers.indexOf(id) + 1;
            console.log('wait for your turn. You are number ' + index + ' in line. ' + json.data.connectedUsers);
            toggleFirstUser('not');
        } else {
            console.log('good to go ' + json.data.connectedUsers);
            toggleFirstUser('first user');
        }
        /*
                    var index = json.data.connectedUsers.indexOf(id)+1;
                    console.log('You are number ' + index + ' in line. ' + json.data.connectedUsers);
        */
    };

    thmb8.addEventListener("click", function() {
        connection.send('char1');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    thmb2.addEventListener("click", function() {
        connection.send('char2');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    thmb3.addEventListener("click", function() {
        connection.send('char3');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    thmb4.addEventListener("click", function() {
        connection.send('char4');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    thmb5.addEventListener("click", function() {
        connection.send('char5');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    thmb6.addEventListener("click", function() {
        connection.send('char6');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    thmb7.addEventListener("click", function() {
        connection.send('char7');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    thmb1.addEventListener("click", function() {
        connection.send('char8');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    color1.addEventListener("click", function() {
        connection.send('color1');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    color2.addEventListener("click", function() {
        connection.send('color2');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    color3.addEventListener("click", function() {
        connection.send('color3');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    color4.addEventListener("click", function() {
        connection.send('color4');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    color5.addEventListener("click", function() {
        connection.send('color5');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });
    color6.addEventListener("click", function() {
        connection.send('color6');
        TweenLite.from(this, 1, {
            opacity: 0
        });
        TweenLite.to(this, 1, {
            opacity: 1
        });
    });

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    var sendUserName = function() {
        if (connection.readyState !== 1/*  && json.data.connectedUsers[0] !== json.data.fbId */) {
	        toggleFirstUser('not');
            status.text('Error. Unable to comunicate with server.');
        } else if (userName !== null) {
            connection.send(userName);
            //connection.send('connectionready');
        }
    }
    
    setInterval(sendUserName, 3000);
    

    //    var stopSendingUserName = function () {
    //         clearInterval(sendUserName);
    //     }
    // 
    //     setTimeout(stopSendingUserName, 12000);
    /**
     * Add message to the chat window
     */

    function addMessage(message) {
        content.prepend('<p>' + message + '</p>');
    }

    cheet('↑ ↑ ↓ ↓ ← → ← → b a', function() {
        alert('Voilà!');
    });
});
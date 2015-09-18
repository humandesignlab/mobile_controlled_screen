$(function() {
    "use strict";
    // for better performance - to avoid searching in DOM
    var content = $('#content');
    var status = $('#status');
    var bg = document.getElementById("bg");
    var character = document.getElementById("character");
    var whiteBox = document.getElementById('bendtherules');
    var whiteBox_pre = document.getElementById('bendtherules-pre');
    var copy_pre = document.getElementById('copy-pre');
    var copy = document.getElementById('copy');
    var logoHPWhite = document.getElementById('logo-hp-white');
    var logoHPWhite_pre = document.getElementById('logo-hp-white-pre');
    var logoHPBlue = document.getElementById('logo-hp-blue');
    var myName = document.getElementById('my-name');
    var compu = document.getElementById('sprite-container');
    var welcome_screen = document.getElementById('welcome-screen');
    var qrcode = document.getElementById('qrcode');
    var myName = false;
    var the_video = document.getElementById('the-video');
    var logo_windows_pre = document.getElementById('logo-windows-pre');
    var logo_windows = document.getElementById('logo-windows');

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
        console.log('Receiving messages:');
    };

    connection.onerror = function(error) {
        // just in there were some problems with conenction...
        content.html($('<p>', {
            text: 'Sorry, but there\'s some problem with your ' + 'connection or the server is down.'
        }));
    };

    var changeCharacter = function(source, percentage) {
        var myImage = document.createElement('img');
        myImage.setAttribute('src', source);
        character.style.opacity = 0;
        if (character.childNodes.length > 0) {
            character.removeChild(character.childNodes[0]);
            character.appendChild(myImage);
            TweenLite.from(character, 1, {
                opacity: 0,
                left: '100%',
                ease: Back.easeOut,
                delay: 1
            });
            TweenLite.to(character, 1, {
                opacity: 1,
                left: percentage,
                ease: Back.easeOut,
                delay: 1
            });
        } else {
            character.appendChild(myImage);
            TweenLite.to(character, 1, {
                opacity: 1,
                left: percentage,
                ease: Back.easeOut,
                delay: 1
            });
        }
    };

    changeCharacter('img/char8.png', '50%');
    var changeBgColor = function(bgColor) {
        TweenLite.to(bg, 1, {
            backgroundColor: bgColor
        });
    };

    var save = function(canvas) { /*html2canvas-0.5.0 work with Promise.js*/
        var img = canvas.toDataURL("image/png");
        var output = encodeURIComponent(img);
        var uniqId = Math.round(+new Date() / 1000);
        var cur_path = '../generated_images/' + uniqId + '.png';
        var Parameters = "image=" + output + "&filedir=" + cur_path;
        $.ajax({
            type: "POST",
            url: "inc/savePNG.php",
            data: Parameters,
            success: function(data) {
                console.log("screenshot done" + data);
            }
        }).done(function() {
            //$('body').html(data);
        });
    };

    var resetBoard = function() {
        connection.close();
        window.location.reload(false);
    };
    
    TweenLite.to(logo_windows_pre, 1, {
        left: '50px',
        ease: Back.easeOut,
        delay: 0.5
    });

    TweenLite.to(logoHPWhite_pre, 1, {
        left: '1540px',
        ease: Back.easeOut,
        delay: 1
    });
    TweenLite.to(whiteBox_pre, 1, {
        left: '50px',
        ease: Back.easeOut,
        delay: 1
    });
    TweenLite.to(copy_pre, 1, {
        left: '50px',
        ease: Back.easeOut,
        delay: 1.5
    });
    TweenLite.to(the_video, 1, {
        opacity: '1',
        ease: Back.easeOut,
        delay: 2
    });

    var loadFinalProductAnimation = function() {
        compu.innerHTML = null;
        var animation = document.createElement('div');
        animation.id = 'final-video';
        animation.style.top = '280px';
        animation.style.left = '-10px';
        animation.style.position = 'absolute';
        animation.style.opacity = '0';
        bg.appendChild(animation);
        var final_video = document.getElementById('final-video');
        TweenLite.to(final_video, 2, {
                opacity: '1',
                delay: 1
            });

        var finalvideo = document.createElement('video');
        finalvideo.id = 'final-video-video';
        finalvideo.src = 'video/output.webm';
        finalvideo.preload = 'auto';
        finalvideo.autoplay = true;
        animation.appendChild(finalvideo);
    };

    // most important part - incoming messages
    connection.onmessage = function(message) {
        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }

        if (json.type === 'message') {
            var completeName = json.data.theUser;
            var firstName = completeName.substr(0, completeName.indexOf(' '));
            writeName(firstName);
            console.log(json.data.theUser);
            console.log(json.data.connectedUsers);
            receiveMessage(json.data.text);
            TweenLite.to(welcome_screen, 1, {
                right: '-3050px',
                ease: Back.easeIn
            });
            TweenLite.to(welcome_screen, 1, {
                display: 'none',
                delay: 3
            });
            var killWelcomeScreen = function() {
                welcome_screen.innerHTML = null;
            };
            setTimeout(killWelcomeScreen, 3000);
            TweenLite.to(bg, 1, {
                opacity: '1',
                ease: Back.easeIn
            });

            switch (json.data.text) {
                case "saveMyAd":
                    html2canvas(bg, {
                        allowTaint: true,
                        logging: true,
                        taintTest: true,
                        onrendered: save /*0.4.1*/
                    }); /*.then(save);0.5.0-rc*/
                    setTimeout(loadFinalProductAnimation, 3000);
                    setTimeout(resetBoard, 13000);
                    break;
                case "char1":
                    changeCharacter('img/char1.png', '50%');
                    break;
                case "char2":
                    changeCharacter('img/char2.png', '50%');
                    break;
                case "char3":
                    changeCharacter('img/char3.png', '50%');
                    break;
                case "char4":
                    changeCharacter('img/char4.png', '50%');
                    break;
                case "char5":
                    changeCharacter('img/char5.png', '50%');
                    break;
                case "char6":
                    changeCharacter('img/char6.png', '50%');
                    break;
                case "char7":
                    changeCharacter('img/char7.png', '50%');
                    break;
                case "char8":
                    changeCharacter('img/char8.png', '50%');
                    break;
                case "color1":
                    changeBgColor('#b0a9db');
                    break;
                case "color2":
                    changeBgColor('#ffcf66');
                    break;
                case "color3":
                    changeBgColor('#94dce1');
                    break;
                case "color4":
                    changeBgColor('#a3d6a1');
                    break;
                case "color5":
                    changeBgColor('#fccfdc');
                    break;
                case "color6":
                    changeBgColor('#ffffff');
                    TweenLite.to(logoHPBlue, 1, {
                        left: '1540px',
                        ease: Back.easeOut,
                        delay: 1
                    });
                    break;
            }
        }
    };

    /*
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            content.html('Unable to comminucate with the server.');
        }
    }, 3000);
    /**
     * Add message to the chat window
     */

    function receiveMessage(message) {
        //content.prepend('<p>' + message + '</p>');
        console.log(message);
    }

    function writeName(usrName) {
        var myName = document.getElementById('my-name');
        myName.innerHTML = usrName;
        TweenLite.to(myName, 1, {
            left: '50px',
            ease: Back.easeOut,
            delay: 3
        });
        TweenLite.to(logo_windows, 1, {
            left: '50px',
            ease: Back.easeOut,
            delay: 3.5
        });
        TweenLite.to(whiteBox, 1, {
            left: '50px',
            ease: Back.easeOut,
            delay: 3.5
        });
        TweenLite.to(copy, 1, {
            left: '50px',
            ease: Back.easeOut,
            delay: 4
        });
        TweenLite.to(logoHPWhite, 1, {
            left: '1540px',
            ease: Back.easeOut,
            delay: 4.5
        });
    }
});
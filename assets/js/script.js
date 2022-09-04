const PRE = "evento_"
var room_id;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var local_stream;
var screenStream;
var peer = null;
var currentPeer = null
var screenSharing = false
const peers = {}

function createRoom(code) {
    peer = new Peer(code)
    peer.on('open', (id) => {
        //document.querySelector('.is_action').value = id
        document.getElementById('navbar_menu').style.display = 'none'
        document.querySelector('.code_room').innerHTML = code
        //document.querySelector('.btn-init-translate').setAttribute('href', '/tradutor.html?code=' + id);
        getUserMedia({ video: true, audio: true }, (stream) => {
            local_stream = stream;
            setLocalStream(local_stream)
        }, (err) => {
            console.log(err)
        })
        //notify("Criando evento...")
        showLive();
    })
    peer.on('call', (call) => {
        call.answer(local_stream);
        var i = 0;
        call.on('stream', (stream) => {
            i++
            if (i == 1) {
                setRemoteStream(stream);
            }
        })
        currentPeer = call;
    })
}

function createRoomTranslate() {
    var hash = (Math.random() + 1).toString(36).substring(7);
    room_id = PRE + hash;
    peer = new Peer(room_id)
    peer.on('open', (id) => {
        document.querySelector('.code-tradutor').append(id)
        getUserMedia({ video: true, audio: true }, (stream) => {
            local_stream = stream;
            setRemoteStreamTranslate(local_stream)
        }, (err) => {
            console.log(err)
        })
        //notify("Criando tradução...")
    })
    peer.on('call', (call) => {
        call.answer(local_stream);
        var i = 0;
        call.on('stream', (stream) => {
            i++
            if (i == 1) {
                const node = document.createElement("p");
                const textnode = document.createTextNode("Novo ouvinte entrou na transmissão.");
                node.appendChild(textnode);
                document.getElementById("local-video").appendChild(node);
            }
        })
        currentPeer = call;
    })
}


function setLocalStream(stream) {

    let video = document.getElementById("local-video");
    video.srcObject = stream;
    video.muted = true;
    video.controls = false;
    video.play();
}

function setRemoteStreamTranslate(stream) {

    let divAudios = document.getElementById("local-video");
    const myAudio = document.createElement('audio')
    myAudio.srcObject = stream;
    myAudio.muted = true
    myAudio.controls = true
    myAudio.addEventListener('loadedmetadata', () => {
        myAudio.play()
    })
    divAudios.append(myAudio)
}

function setRemoteStream(stream) {

    document.querySelector('.show-joins').style.display = 'flex';
    let divAudios = document.getElementById("remote-video");
    const div = document.createElement('div');
    div.setAttribute('class', 'col-4 pt-2 px-1');
    const myVideo = document.createElement('video')
    myVideo.srcObject = stream;
    myVideo.muted = true
    myVideo.controls = true
    myVideo.addEventListener('loadedmetadata', () => {
        myVideo.play()
    })
    div.append(myVideo)
    divAudios.append(div)
}

function notify(msg) {
    let notification = document.getElementById("notification")
    notification.innerHTML = msg
    notification.hidden = false
    setTimeout(() => {
        notification.hidden = true;
    }, 3000)
}

function showLive() {
    document.getElementById("content-options").style.display = "none";
    document.getElementById("meet-area").style.display = "grid";
}

function joinRoom(code) {
    peer = new Peer()
    peer.on('open', (id) => {
        document.getElementById('navbar_menu').style.display = 'none'
        document.querySelector('.code_room').innerHTML = code
        //document.querySelector('.btn-init-translate').style.display = 'block'
        //document.querySelector('.info-translate').style.display = 'none'
        //document.querySelector('.btn-init-translate').setAttribute('href', '/tradutor.html?code=' + code);
        getUserMedia({ video: true, audio: true }, (stream) => {
            local_stream = stream;
            //setRemoteStream(local_stream);
            //notify("Conectando-se ao evento...")
            let call = peer.call(code, stream)
            var i = 0;
            call.on('stream', (stream) => {
                i++
                if (i == 1) {
                    setLocalStream(stream)
                }
            })
            peers[id] = call;
            showLive();
        }, (err) => {
            console.log(err)
        })

    })
}

function joinRoomTranslate(code) {
    peer = new Peer()
    peer.on('open', (id) => {
        getUserMedia({ video: true, audio: true }, (stream) => {
            local_stream = stream;
            setRemoteStreamTranslate(local_stream)
            //notify("Conectando-se ao evento...")
            let call = peer.call(code, stream)
            var i = 0;
            /*call.on('stream', (stream) => {
                i++
                if (i == 1) {
                    setRemoteStreamTranslate(stream);
                }
            })*/
            peers[id] = call;
        }, (err) => {
            console.log(err)
        })

    })
}

//get params url jquery
function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};

function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}
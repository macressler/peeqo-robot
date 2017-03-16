$(document).ready(function(){

	require('app-module-path').addPath(__dirname);
	const path = require('path')
	const ipcRenderer = require('electron').ipcRenderer
	const natural = require('natural')
	const tokenizer = new natural.WordTokenizer()

	// turn console logs off by uncommenting this line

	//console.log = function(){}

	// GLOBALS
	global.isSleeping = false
	global.ledOn = false
	global.gifType = 'remote' // whether to search 'local' or 'remote'
	global.mediaFormat = 'gif'  // use the mp4 or gif version from gif - 'video', 'gif'
	
	// WIFI CONFIG & ONLINE TEST
	const onlineStatus = require('js/wireless/is-online')()

	if(process.platform != 'darwin'){
		const ble = require('js/wireless/ble')()
	}
	

	// SOCKETS
	const power_sockets = require('js/sockets/power')() // shutdown, reboot, refresh
	const demo_sockets = require('js/sockets/demo')()
	const extension_sockets = require('js/sockets/demo')()
	const test_sockets = require('js/sockets/test')()
	const webcontrol_sockets = require('js/sockets/webcontrol')()

	// EVENTS & LISTENERS
	const event = require('js/events/events')
	const listener = require('js/events/listeners')()
	const intent = require('js/actions/intents')()
	const common = require('js/gifs/common-gif-functions')()

	// RESPONSES
	const response = require('js/data/responses')
	console.log(response)


	// START EYES
	event.emit("show-div","eyeWrapper")
	event.emit("start-blinking")


	// RESET EVERYTHING ON BOOP
	$("body").on("click", function(e){
		
		e.preventDefault()

		var obj = {
					type: gifType,  // local/remote/direct - on system, giphy, direct gif link
					query: common.setQuery(response.greeting.hello), 
					format: common.setFormat(),
					path:null,
					duration: null,
					loop: false,
					servo: response.greeting.hello.servo,
					led:response.greeting.hello.led,
					sound: response.greeting.hello.sound,
					loopSound: false,
					callback: function(){
						console.log("LEDDD OFFF")
						event.emit("led","off")
					}
				}
		event.emit("animate", obj)

		//event.emit('do',null,'addSkill')

		//event.emit("show-div","videoWrapper")

		// var boop = path.join(process.env.PWD,'app', images', 'local', 'r_boop', 'boop.gif')

		// event.emit("play-gif",boop)

		// setTimeout(function(){
		// 	event.emit("reset")
		// },2000)
	})


	// ON HOTWORD DETECTION
	ipcRenderer.on("hotword", function(evt,arg){
		console.log("HOTWORD",arg)
		ledOn = true

		setTimeout(function(){
			if(ledOn == true){
				event.emit("led", "off")
			}
		},3000)

		if(isSleeping){
			event.emit("led", "fadeRed")
		} else {
			var obj = {
				gif_type:null,  //local/remote/null
				gif_category:null,
				gif_url: null,
				gif_loop_forever: false,
				servo:"alert",
				led:"alert",
				sound:"alert",
				sound_loop_forever: false,
				callback: null
			}

			event.emit("animate", obj)
		}
	})

	// ON FINAL RESULT
	ipcRenderer.on("final-results", function(evt,msg){
		console.log("FINAL", msg)
		event.emit('led','off')
		ledOn = false
		tokenizeAndSend(msg.toLowerCase())
		
	})

	// ON PARTIAL RESULT
	ipcRenderer.on("partial-results", function(evt, msg){
		console.log("Partial", msg)
	})

	function tokenizeAndSend(string){
		var words = tokenizer.tokenize(string)

		if(words.length){
			intent.parse(words)
		}
	}

})
const Discord = require('discord.io');
var auth = require('./auth.json');
var moment = require('moment');
moment().format()
/* Initialize bossTime so no error*/
var bossTime = moment();

/* Set the boss spawn time in my time given the time until boss spawn*/
function setTime(time){
	bossTime = moment();
	let temp = convertToArray(time);
	bossTime.add(temp[0],'h').add(temp[1],'m');	
	//console.log(bossTime.toString());
	return 'boss time is set to: ' + temp[0] + ' hour(s) ' + temp[1] + ' minutes from now on';		
}
/* Given the user time, convert the time difference until boss spawn for them*/
function getTimeDifference(user_time, my_time){
	let my_minutes = my_time.minutes();
	let my_hours = my_time.hours();
	let temp_time = bossTime.clone();
	// get the current time difference till boss spawn in my time
	temp_time.subtract(my_hours,'hours').subtract(my_minutes,'minutes');
	// know this is a special case requested by the bot
	if(user_time.toString() === 'bot'){
		return temp_time.hours() + ' hours ' + temp_time.minutes() + ' minutes\n';
	}
	let temp_var = convertToArray(user_time);
	let time_boss_user = moment(temp_var[0].toString() + temp_var[1].toString(), "hmm");
	// get time boss spawn for user in their time
	time_boss_user.add(temp_time.hours(),'h').add(temp_time.minutes(),'m');
	let msg = "Boss will spawn in: " + temp_time.hours() + ' hours ' + temp_time.minutes() + ' minutes\n' + 
			  "Boss will spawn at: " + time_boss_user.hours() + " o'clock and " + time_boss_user.minutes() + ' minutes for you!\n';
	return msg;		
}

function printCommandTable(){
	var command = "This is the list of commands:\n" +
				  "!setbt time	        --set the time until boss spawn. Input time in the format hh:mm\n" +
				  "!getbt my_time	--get the time that boss will spawn in your time. Input my_time in the format hh:mm\n" +
				  "!date			           --get DarkMagicIan's current time...\n" +
				  "!help			           --print out the table of bots command\n";
				  //"!timer                     --enable bot to shout out boss spawn time every 10 minutes\n";
	return command;
}
/* Given a time in string format, convert it to array w/ [hr,min]*/
function convertToArray(time){
	time = time.toString();
	/* console.log(typeof time);
	console.log(time);
	console.log(time.includes(":")); */
	if(!time.includes(":")){
		return 'You did not provide time in the format hh:mm';
	}
	let timeArray = time.split(":");
	return timeArray;
}
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    console.log('Logged in as %s - %s\n', bot.username, bot.id);
});
bot.on('message', function (user, userID, channelID, message, evt) {
	// make sure bot only speak in #bot-works OR #general of test-bot channel
	if(channelID == 306616811707826179 || channelID == 366786162238554114 ){ //||channelID == 231341597650845696){
		// ignore its own message
		// Our bot needs to know if it will execute a command
		// It will listen for messages that will start with `!`
		if (message.substring(0, 1) == '!') {
			let current = moment();
			var args = message.substring(1).split(' ');
			var cmd = args[0]; 
			args = args.splice(1);
			switch(cmd) {				
				// set boss spawn time
				case 'setbt':
					// track whoever is setting boss time
					console.log(user + " " + userID);
					let str = setTime(args.toString());
					bot.sendMessage({
						to: channelID,
						message : str,
					});
				break;
				// get my time
				case 'date':
					bot.sendMessage({
						to: channelID,
						message: current.toString(),
					});
				break;
				// get boss time in my time(temporary)
				case 'getbt':
					let time_difference = getTimeDifference(args,current);
					bot.sendMessage({
						to: channelID,
						message: time_difference,
					});
				break;
				// bot will shout out every 10 minutes when boss spawn time is
				case 'timer':
					let interval = setInterval(function(){
						let temp_str = getTimeDifference('bot',current);
						bot.sendMessage({
							to: channelID,
							message: "@everyone"  + temp_str,
						});
					},1000);
				break;
				// print out list of commands
				case 'help':
					bot.sendMessage({
						to: channelID,
						message: printCommandTable(),
					});
				break;
				default:
					bot.sendMessage({
						to: channelID,
						message: "<@!" + userID + ">" + ' No commands matching! Type !help for list of commands',
					});
				// Just add any case commands if you want to..
			 }
		 }
	}
});


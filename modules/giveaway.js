let entries = {
    "kleptik": [2, "114210824528068611"],
    "nimchip": [3, "131897531251556352"],
    "talgryf": [5, "269145186032943104"],
    "brakthir": [5, "119637578050699264"],
    "zeroblade": [5, "195605929637445633"],
    "phem0r": [5, "239543641197117441"],
    "filmstrips": [5, "175701090099003393"],
    "lexpatrona": [8, "247107919064203265"],
    "name": [10, "235237261891993600"],
};

exports.draw = function(msg) {

    let giveawayString = msg.content.match(/!pgiveaway \d+/g);

    if (giveawayString) {

        let numWinners = giveawayString[0].match(/\d+/g);

        if (numWinners >= Object.keys(entries).length) {
            msg.channel.send("Number of winners exceeds total number of eligible entrants.")
            return
        }

        let pool = [];

        for (var key in entries) {

            if (entries.hasOwnProperty(key)) {
    
                for (var i = 0; i < entries[key][0]; i++) {
                    pool.push(key);
                }
            }
        }

        let winners = [];

        for (var i = 0; i < numWinners; i++) {

            let winner = pool[getRandomInt(0, pool.length)];

            while (winners.includes(winner)) {

                winner = pool[getRandomInt(0, pool.length)];
            }

            winners.push(winner);
        }
    
        msg.channel.send("Drawing in...")

        let countdown = 5

        let interval = setInterval(() => {
        
            if (countdown > 0) {
                msg.channel.send(countdown);
            }
        
            countdown--;

            if (countdown < 0) {

                clearInterval(interval);

                msg.channel.send("Congrats to...")

                winners.forEach(winner => {

                    let winnerID = entries[winner][1];

                    msg.channel.send("<@" + winnerID + ">");
                });

                msg.channel.send("🎉     🎊     🎉     🎊     🎉     🎊")
            }
        }, 2000);
    }

    else {
        msg.channel.send("Reenter command with the number of winners. '!pgiveaway 5'")
    }
};

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
module.exports = function (grunt) {

    var config = {
        database: {
            src: [
                "database/*.{json,json5}",
                "database/media/*!(gfx).json"
            ],
            dest: "build/map.json"
        },
        rawToDist: {
            files: [
                {
                    src: [
                        "database/media/gfx.json"
                    ],
                    dest: "dist/gfx.json"
                },
                {
                    src: [
                        "database/events/seasons.json"
                    ],
                    dest: "dist/season.json"
                }
            ]
        }
    };

    grunt.registerTask("convertInExtraFile", function () {
        var tracks = require("../database/tracks.json5"), // rename first
            data = {};

        tracks.forEach(function(track){
            // startline  datacube  candies
            if("coords" in track) {
                data[track.id] = track.coords;
            }
        });

        //console.log(JSON.stringify(data, null, 2))
        //grunt.file.write("database/media/coords.json", JSON.stringify(data, null, 2));
    });

    grunt.registerTask("convertInNewFormat", function () {
        var tracks = require("../database/times.json"),
            data = {};

        /*
         {"s":{"f":2,"t":"0:35.000"},"g":{"f":1,"t":"0:26.100"},"p":{"f":0,"t":"0:20.400"}}
         {
             "s": {
                 "f": 3,
                 "t": "0:46.000"
             },
             "g": {
                 "f": 0,
                 "t": "0:38.000"
             },
             "p": {
                 "f": 0,
                 "t": "0:30.000"
             }
         }
         ---------
         ["2|035.000","1|026.100","0|020.400"]
         */

        tracks.forEach(function(track){
            var trackId = track.id;
            data[trackId] = [];

            data[trackId].push(track.s.f + "|" + track.s.t.replace(/(\:)|(\.)/g,""))
            data[trackId].push(track.g.f + "|" + track.g.t.replace(/(\:)|(\.)/g,""))
            data[trackId].push(track.p.f + "|" + track.p.t.replace(/(\:)|(\.)/g,""))
        });

        var jsonForFile = JSON.stringify(data, null)
            .replace(/],/g,"],\n\t");

        console.log(jsonForFile)
        //grunt.file.write("database/timesNew.json", jsonForFile);
    });

    grunt.registerTask("mergePublicTimesToDatabase", function () {
        // backup
        grunt.task.run("copy:timesBackup");
        // merge to /build and copy to database
        grunt.task.run("mergePublicWithProdTimes");
        grunt.task.run("copy:timesToDatabase");
        // clear
        grunt.task.run("clearTimes");
        // deploy
        grunt.task.run("deploy");
    });

    grunt.registerTask("mergePublicWithProdTimes", function () {
        var publicTimes = JSON.parse(grunt.file.read("dist/times.json"));
        var prodTimes = JSON.parse(grunt.file.read("database/times.json"));

        publicTimes.times.forEach(function (track) {
            prodTimes.times.forEach(function (_track_, index) {
                if (parseInt(track.id) == parseInt(_track_.id)) {
                    prodTimes.times[index] = track
                }
            })
        });

        //grunt.file.write("build/times.json", JSON.stringify(prodTimes, null, 2));
    });

    grunt.registerTask("clearTimes", function () {
        //grunt.file.write("dist/times.json", "[]");
    });

    grunt.registerTask("convertFriendsToDatabase", function () {
        var friendsJSON = JSON.parse(grunt.file.read("database/raw/friends-ubisoft.json")),
            friendNames = [];

        friendsJSON.forEach(function (friendData) {
            if (friendData.state == "Friends") {
                //friendNames.push(friendData.nameOnPlatform + ":" + friendData.pid);
                friendNames.push(friendData.nameOnPlatform);
            }
        });

        //grunt.file.write("database/friends.json", JSON.stringify(friendNames, null, 2));
    });

    return config;
};
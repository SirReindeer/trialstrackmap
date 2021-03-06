angular.module("trialsTrackmap")
    .controller("trackmap", function ($rootScope, $scope, $filter, loader, improveTimes, categories) {
        $scope.data = {};

        loader.get(["map", "gfx"]).then(function (data) {
            Object.keys(data.database).forEach(function (_dataKeyName_) {
                $scope.data[_dataKeyName_] = data.database[_dataKeyName_];
            });

            $scope.data.images = data.images;
            $scope.data.hoster = data.hoster;

            $rootScope.$emit("data:loaded", $scope.data);
        });

        $scope.repeatObject = function (object) {
            return Object.keys(object);
        };

        $scope.getTracks = function (searchTrack) {
            var tracks = $scope.data.tracks,
                dataCubeCat = 6,
                filteredArray = [],
                tiersObject = {};
            // walk through tracks
            tracks.forEach(function (track) {
                if (searchTrack && searchTrack != "" && track.i18n.toLowerCase()
                        .indexOf(searchTrack.toLowerCase()) == -1
                    || track.tier == 0) {
                    return;
                }

                var trackCats = track.cats.split(",").map(Number);
                // create tier
                if (!(track.tier in tiersObject)) {
                    tiersObject[track.tier] = {
                        number: track.tier,
                        cats: {}
                    };
                }
                // create cats
                trackCats.forEach(function (cat) {
                    if (cat === dataCubeCat) {
                        return;
                    }

                    var catClass = $scope.data.map.cats[cat - 1].class;

                    if (!(catClass in tiersObject[track.tier].cats)) {
                        tiersObject[track.tier].cats[catClass] = [];
                    }
                    tiersObject[track.tier].cats[catClass].push(track);
                });
            });

            if (Object.keys(tiersObject).length > 0) {
                Object.keys(tiersObject).forEach(function (tier) {
                    filteredArray.push(tiersObject[tier]);
                });
            }

            return filteredArray;
        };

        $scope.handleSidebars = function (event, which, action, forceClose) {
            function handleBar(_which_, _forceClose_) {
                var sidebar = angular.element(document.querySelector(".new-sidebar." + _which_));

                // open
                if (!_forceClose_ && !sidebar.hasClass("open")) {
                    // check if opposite is open
                    if (action && action.indexOf("toggle") >= 0) {
                        if (handleBar(action.replace("toggle", "").toLowerCase(), true))
                            return false;
                    }
                    sidebar.addClass("open");
                    return false;
                    // close if isnt closed
                } else if (sidebar.hasClass("open")) {
                    sidebar.removeClass("open");
                    return true;
                }
            }

            if (which == "close") {
                handleBar("left", true);
                handleBar("right", true);
                return false;
            } else if (forceClose) {
                handleBar(which, true);
                return false;
            } else {
                event.stopPropagation();
                handleBar(which);
            }
        };

        function mergeTrackData(onlyI18n) {

            function convertYoutube(videoRaw){
                // only id
                // d9dcQwzfoAE
                // with host
                // 1|d9dcQwzfoAE
                // with host and video type
                // 1|d9dcQwzfoAE|2
                var types = $scope.data.media.youtube.types,
                    tutorialGuys = $scope.data.media.youtube.hosts,
                    hasHost = videoRaw.indexOf("|") >= 0,
                    videoArr = videoRaw.split("|");

                return {
                    host: (hasHost ? tutorialGuys[videoArr[0]].name : ""),
                    hostUrl: (hasHost ? tutorialGuys[videoArr[0]].url : ""),
                    url: "#3/" + videoArr[hasHost ? 1 : 0],
                    type: videoArr.length === 3 ? (types[videoArr[2]] != "" ? "-" : "") + types[videoArr[2]] : "-" + types["1"]
                }
            }

            $scope.data.tracks.forEach(function (track, index) {
                if (!onlyI18n) {
                    var trackId = track.id;

                    if (trackId in $scope.data.times) {
                        var times = $scope.data.times[trackId],
                            silver = times[0].split("|"),
                            gold = times[1].split("|"),
                            platinum = times[2].split("|"),
                            androidWR = {
                                normal: [],
                                donkey: [],
                                crazy: []
                            },
                            iosWR = {
                                normal: [],
                                donkey: [],
                                crazy: []
                            };

                        if (trackId in $scope.data.worldrecords.times) {
                            var worldRecords = $scope.data.worldrecords.times[trackId].split("|");

                            androidWR.normal = worldRecords[0].split(":");
                            androidWR.normal[0] = $scope.data.worldrecords.rider[androidWR.normal[0]];
                            androidWR.donkey = worldRecords[1].split(":");
                            androidWR.donkey[0] = $scope.data.worldrecords.rider[androidWR.donkey[0]];
                            androidWR.crazy = worldRecords[2].split(":");
                            androidWR.crazy[0] = $scope.data.worldrecords.rider[androidWR.crazy[0]];

                            iosWR.normal = worldRecords[3].split(":");
                            iosWR.normal[0] = $scope.data.worldrecords.rider[iosWR.normal[0]];
                            iosWR.donkey = worldRecords[3].split(":");
                            iosWR.donkey[0] = $scope.data.worldrecords.rider[iosWR.donkey[0]];
                            iosWR.crazy = worldRecords[3].split(":");
                            iosWR.crazy[0] = $scope.data.worldrecords.rider[iosWR.crazy[0]];
                        }

                        track.times = {
                            silver: {
                                faults: silver[0] ? silver[0] : 0 ,
                                time: silver[1]
                            },
                            gold: {
                                faults: gold[0] ? gold[0] : 0,
                                time: gold[1]
                            },
                            platinum: {
                                faults: platinum[0] ? platinum[0] : 0,
                                time: platinum[1]
                            },
                            worldRecord: {
                                android: {
                                    normal: {
                                        rider: androidWR.normal[0],
                                        time: androidWR.normal[1]
                                    },
                                    donkey: {
                                        rider: androidWR.donkey[0],
                                        time: androidWR.donkey[1]
                                    },
                                    crazy: {
                                        rider: androidWR[0],
                                        time: androidWR[1]
                                    }
                                },
                                ios: {
                                    normal: {
                                        rider: iosWR.normal[0],
                                        time: iosWR.normal[1]
                                    },
                                    donkey: {
                                        rider: iosWR.donkey[0],
                                        time: iosWR.donkey[1]
                                    },
                                    crazy: {
                                        rider: iosWR.crazy[0],
                                        time: iosWR.crazy[1]
                                    }
                                }
                            }
                        }
                    }
                    // parts
                    if (trackId in $scope.data.parts) {
                        track.parts = $scope.data.parts[trackId];
                        if ("g" in $scope.data.parts[trackId]) {
                            track.gems = $scope.data.parts[trackId].g;
                        }
                    }

                    // coords
                    if (trackId in $scope.data.media.coords) {
                        track.coords = $scope.data.media.coords[trackId];
                    }

                    // startline
                    if (trackId in $scope.data.media.startlines) {
                        track.startline = "#1/" + $scope.data.media.startlines[trackId];
                    }

                    // datacube
                    if (trackId in $scope.data.media.datacubes) {
                        track.datacube = "#1/" + $scope.data.media.datacubes[trackId];
                    }

                    // candys
                    if (trackId in $scope.data.media.candies) {
                        track.candies = $scope.data.media.candies[trackId];
                    }

                    // youtube
                    if (trackId in $scope.data.media.youtube.videos) {
                        var videos = $scope.data.media.youtube.videos[trackId];
                        track.youtube = [];
                        if(typeof videos == "string") {
                            track.youtube.push(convertYoutube($scope.data.media.youtube.videos[trackId]));
                        } else {
                            videos.forEach(function(video){
                                track.youtube.push(convertYoutube(video));
                            });
                        }
                    }

                    // gem and fuel amount
                    switch (true) {
                        case track.tier == 1:
                            track.fuel = 5;
                            track.gems = "gems" in track ? track.gems : 5;
                            break;
                        case track.tier == 2:
                            track.fuel = 7;
                            track.gems = "gems" in track ? track.gems : 7;
                            break;
                        case track.tier == 3:
                            track.fuel = 10;
                            track.gems = "gems" in track ? track.gems : 10;
                            break;
                    }

                    // improve time
                    track.improve = improveTimes.getOne(trackId, track);
                }

                track.i18n = $filter("translate")("tracks." + track.id) +
                    (track.level ? " (level " + track.level + ")" : "");
            });

            //console.log($scope.data);
        };

        $scope.visibility = function (variable) {
            $scope[variable] = $scope[variable] ? false : true;
        };

        $rootScope.$on("handleSidebars", function ($evt, event, which, action, forceClose) {
            $scope.handleSidebars(event, which, action, forceClose);
        });

        $rootScope.$on("data:loaded", function () {

            categories.setAll($scope.data.map.cats);

            mergeTrackData();

            $scope.tierlegend = $scope.getTracks();

            $scope.$watch("searchTrack", function (data) {
                $scope.tierlegend = $scope.getTracks(data);
            });

            $rootScope.$on("$translateChangeSuccess", function () {
                mergeTrackData(true);
            });
        });
    })
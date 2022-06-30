//Simple version, without validation or sanitation
exports.login = function (req, res) {
    if(req.body.username=='Admin' && req.body.password=='Admin123') {
        res.status(200).send({success: true});
    } else {
        res.status(403).send({success: false, message: 'Invalid Credentials' });
    }
};

exports.seasons = function (req, res) {
    res.status(200).send(seasons);
};

exports.players = function (req, res) {
    res.status(200).send(players);
};

exports.addPlayer = function (req, res) {
    players.push(req.body);
    res.status(201).send({success: true});
};

exports.updatePlayer = function (req, res) {
    let index = players.findIndex(p=>p.id==req.params.id);
    players.splice(index, 1, req.body);
    res.status(201).send({success: true});
};

exports.deletePlayer = function (req, res) {
    let index = players.findIndex(p=>p.id==req.params.id);
    players.splice(index, 1);
    res.status(200).send({success: true});
};

exports.countries = function (req, res) {
    res.status(200).send(countries);
};

exports.addCountry = function (req, res) {
    countries.push(req.body);
    res.status(201).send({success: true});
};

exports.updateCountry = function (req, res) {
    let index = countries.findIndex(c=>c.id==req.params.id);
    countries.splice(index, 1, req.body);
    res.status(201).send({success: true});
};

exports.deleteCountry = function (req, res) {
    let index = countries.findIndex(c=>c.id==req.params.id);
    countries.splice(index, 1);
    res.status(200).send({success: true});
};

exports.seasonDetails = function (req, res) {
    let data = seasonDetails.find(o=>o.id==req.params.id);
    res.status(200).send(data);
};

exports.saveSeasonDetails = function (req, res) {
    let index = seasonDetails.findIndex(o=>o.id==req.body.id);
    seasonDetails.splice(index, 1, req.body);
    res.status(201).send({success: true});
};

exports.saveMatchDetails = function (req, res) {
    matchDetails.push(req.body);
    updateSeasonDetails(req.body);
    res.status(201).send({success: true});
};

exports.getMatchDetails = function (req, res) {
    let data = matchDetails.find(o=>o.id==req.params.id);
    res.status(200).send(data);
};

exports.deleteSeason = function (req, res) {
    let index = seasonDetails.findIndex(o=>o.id==req.params.id);
    seasonDetails.splice(index, 1);
    let i = seasons.findIndex(o=>o.id==req.params.id);
    seasons.splice(i, 1);
    res.status(200).send({success: true});
};

exports.addSeason = function (req, res) {
    seasons.push(req.body);
    addNewSeasonDetails(req.body);
    res.status(201).send({success: true, id: req.body.id});
};

const addNewSeasonDetails = function(season) {
    let topSixteen = [...countries].sort((a,b)=>a.rank-b.rank).slice(0,16);
    let blankSeason = JSON.parse(JSON.stringify(blankSeasonDetails));
    blankSeason.roundOf16.forEach((o) => {
        o.id = generateUuid();
    });
    blankSeason.quarterFinals.forEach((o) => {
        o.id = generateUuid();
    });
    blankSeason.semiFinals.forEach((o) => {
        o.id = generateUuid();
    });
    blankSeason.final.id = generateUuid();
    blankSeason.id = season.id;
    blankSeason.status = season.status;
    blankSeason.name = season.name;
    topSixteen.forEach((c, index) => {
        if(index%2==0) {
            let teamOne = JSON.parse(JSON.stringify(blankTeam));
            teamOne.name = c.name;
            teamOne.rank = c.rank;
            let teamTwo = JSON.parse(JSON.stringify(blankTeam));
            teamTwo.name = topSixteen[index+1].name;
            teamTwo.rank = topSixteen[index+1].rank;
            blankSeason.roundOf16[index/2]['teamOne'] = JSON.parse(JSON.stringify(teamOne));
            blankSeason.roundOf16[index/2]['teamTwo'] = JSON.parse(JSON.stringify(teamTwo));
        }
    });
    seasonDetails.push(JSON.parse(JSON.stringify(blankSeason)));
}

const updateSeasonDetails = function(matchDetails) {
    let s = seasonDetails.find(season=>{
        if(matchDetails.stage=='Round of 16') {
            let i = season.roundOf16.findIndex(ro=>ro.id==matchDetails.id);
            if(i>-1) {
                return season;
            }
        }
        if(matchDetails.stage=='Quarter Final') {
            let i = season.quarterFinals.findIndex(ro=>ro.id==matchDetails.id);
            if(i>-1) {
                return season;
            }
        }
        if(matchDetails.stage=='Semi Final') {
            let i = season.semiFinals.findIndex(ro=>ro.id==matchDetails.id);
            if(i>-1) {
                return season;
            }
        }
        if(matchDetails.stage=='Final') {
            if(season.final.id==matchDetails.id) {
                return season; 
            }
        }
    });
    let jindex = seasonDetails.findIndex(sa=>sa.id==s.id);
    if(matchDetails.stage=='Round of 16') {
        let i = s.roundOf16.findIndex(ro=>ro.id==matchDetails.id);
        if(i>-1) {
            s.roundOf16[i].date = matchDetails.date;
            s.roundOf16[i].teamOne.score = matchDetails.teamOne.score;
            s.roundOf16[i].teamTwo.score = matchDetails.teamTwo.score;
            s.roundOf16[i].status = matchDetails.status;
            if(s.roundOf16[i].teamOne.score>s.roundOf16[i].teamTwo.score) {
                s.roundOf16[i].teamOne.isWinner = true; 
            } else if(s.roundOf16[i].teamOne.score<s.roundOf16[i].teamTwo.score) {
                s.roundOf16[i].teamTwo.isWinner = true; 
            } else if(s.roundOf16[i].teamOne.score==s.roundOf16[i].teamTwo.score) {
                s.roundOf16[i].teamOne.penaltyScore = matchDetails.teamOne.penaltyScore;
                s.roundOf16[i].teamTwo.penaltyScore = matchDetails.teamTwo.penaltyScore; 
                s.roundOf16[i]['penalty'] = {
                    totalPenalties: 1
                }
                if(s.roundOf16[i].teamOne.penaltyScore>s.roundOf16[i].teamTwo.penaltyScore) {
                    s.roundOf16[i].teamOne.isWinner = true; 
                } else {
                    s.roundOf16[i].teamTwo.isWinner = true; 
                }
            }
            if(s.roundOf16[i].matchNumber==1) {
                s.quarterFinals[0].teamOne.name = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.name:
                                                    s.roundOf16[i].teamTwo.name;
                s.quarterFinals[0].teamOne.rank = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.rank:
                                                    s.roundOf16[i].teamTwo.rank;                                   
            }
            if(s.roundOf16[i].matchNumber==2) {
                s.quarterFinals[0].teamTwo.name = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.name:
                                                    s.roundOf16[i].teamTwo.name;
                s.quarterFinals[0].teamTwo.rank = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.rank:
                                                    s.roundOf16[i].teamTwo.rank;                                   
            }
            if(s.roundOf16[i].matchNumber==3) {
                s.quarterFinals[1].teamOne.name = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.name:
                                                    s.roundOf16[i].teamTwo.name;
                s.quarterFinals[1].teamOne.rank = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.rank:
                                                    s.roundOf16[i].teamTwo.rank;                                   
            }
            if(s.roundOf16[i].matchNumber==4) {
                s.quarterFinals[1].teamTwo.name = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.name:
                                                    s.roundOf16[i].teamTwo.name;
                s.quarterFinals[1].teamTwo.rank = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.rank:
                                                    s.roundOf16[i].teamTwo.rank;                                   
            }
            if(s.roundOf16[i].matchNumber==5) {
                s.quarterFinals[2].teamOne.name = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.name:
                                                    s.roundOf16[i].teamTwo.name;
                s.quarterFinals[2].teamOne.rank = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.rank:
                                                    s.roundOf16[i].teamTwo.rank;                                   
            }
            if(s.roundOf16[i].matchNumber==6) {
                s.quarterFinals[2].teamTwo.name = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.name:
                                                    s.roundOf16[i].teamTwo.name;
                s.quarterFinals[2].teamTwo.rank = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.rank:
                                                    s.roundOf16[i].teamTwo.rank;                                   
            }
            if(s.roundOf16[i].matchNumber==7) {
                s.quarterFinals[3].teamOne.name = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.name:
                                                    s.roundOf16[i].teamTwo.name;
                s.quarterFinals[3].teamOne.rank = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.rank:
                                                    s.roundOf16[i].teamTwo.rank;                                   
            }
            if(s.roundOf16[i].matchNumber==8) {
                s.quarterFinals[3].teamTwo.name = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.name:
                                                    s.roundOf16[i].teamTwo.name;
                s.quarterFinals[3].teamTwo.rank = s.roundOf16[i].teamOne.isWinner?
                                                    s.roundOf16[i].teamOne.rank:
                                                    s.roundOf16[i].teamTwo.rank;                                   
            }
        }
    }
    if(matchDetails.stage=='Quarter Final') {
        let i = s.quarterFinals.findIndex(ro=>ro.id==matchDetails.id);
        if(i>-1) {
            s.quarterFinals[i].date = matchDetails.date;
            s.quarterFinals[i].teamOne.score = matchDetails.teamOne.score;
            s.quarterFinals[i].teamTwo.score = matchDetails.teamTwo.score;
            s.quarterFinals[i].status = matchDetails.status;
            if(s.quarterFinals[i].teamOne.score>s.quarterFinals[i].teamTwo.score) {
                s.quarterFinals[i].teamOne.isWinner = true; 
            } else if(s.quarterFinals[i].teamOne.score<s.quarterFinals[i].teamTwo.score) {
                s.quarterFinals[i].teamTwo.isWinner = true; 
            } else if(s.quarterFinals[i].teamOne.score==s.quarterFinals[i].teamTwo.score) {
                s.quarterFinals[i].teamOne.penaltyScore = matchDetails.teamOne.penaltyScore;
                s.quarterFinals[i].teamTwo.penaltyScore = matchDetails.teamTwo.penaltyScore; 
                s.quarterFinals[i]['penalty'] = {
                    totalPenalties: 1
                }
                if(s.quarterFinals[i].teamOne.penaltyScore>s.quarterFinals[i].teamTwo.penaltyScore) {
                    s.quarterFinals[i].teamOne.isWinner = true; 
                } else {
                    s.quarterFinals[i].teamTwo.isWinner = true; 
                }
            }
            if(s.quarterFinals[i].matchNumber==1) {
                s.semiFinals[0].teamOne.name = s.quarterFinals[i].teamOne.isWinner?
                                                    s.quarterFinals[i].teamOne.name:
                                                    s.quarterFinals[i].teamTwo.name;
                s.semiFinals[0].teamOne.rank = s.quarterFinals[i].teamOne.isWinner?
                                                    s.quarterFinals[i].teamOne.rank:
                                                    s.quarterFinals[i].teamTwo.rank;                                   
            }
            if(s.quarterFinals[i].matchNumber==2) {
                s.semiFinals[0].teamTwo.name = s.quarterFinals[i].teamOne.isWinner?
                                                    s.quarterFinals[i].teamOne.name:
                                                    s.quarterFinals[i].teamTwo.name;
                s.semiFinals[0].teamTwo.rank = s.quarterFinals[i].teamOne.isWinner?
                                                    s.quarterFinals[i].teamOne.rank:
                                                    s.quarterFinals[i].teamTwo.rank;                                   
            }
            if(s.quarterFinals[i].matchNumber==3) {
                s.semiFinals[1].teamOne.name = s.quarterFinals[i].teamOne.isWinner?
                                                    s.quarterFinals[i].teamOne.name:
                                                    s.quarterFinals[i].teamTwo.name;
                s.semiFinals[1].teamOne.rank = s.quarterFinals[i].teamOne.isWinner?
                                                    s.quarterFinals[i].teamOne.rank:
                                                    s.quarterFinals[i].teamTwo.rank;                                   
            }
            if(s.quarterFinals[i].matchNumber==4) {
                s.semiFinals[1].teamTwo.name = s.quarterFinals[i].teamOne.isWinner?
                                                    s.quarterFinals[i].teamOne.name:
                                                    s.quarterFinals[i].teamTwo.name;
                s.semiFinals[1].teamTwo.rank = s.quarterFinals[i].teamOne.isWinner?
                                                    s.quarterFinals[i].teamOne.rank:
                                                    s.quarterFinals[i].teamTwo.rank;                                   
            }
        }
    }
    if(matchDetails.stage=='Semi Final') {
        let i = s.semiFinals.findIndex(ro=>ro.id==matchDetails.id);
        if(i>-1) {
            s.semiFinals[i].date = matchDetails.date;
            s.semiFinals[i].teamOne.score = matchDetails.teamOne.score;
            s.semiFinals[i].teamTwo.score = matchDetails.teamTwo.score;
            s.semiFinals[i].status = matchDetails.status;
            if(s.semiFinals[i].teamOne.score>s.semiFinals[i].teamTwo.score) {
                s.semiFinals[i].teamOne.isWinner = true; 
            } else if(s.semiFinals[i].teamOne.score<s.semiFinals[i].teamTwo.score) {
                s.semiFinals[i].teamTwo.isWinner = true; 
            } else if(s.semiFinals[i].teamOne.score==s.semiFinals[i].teamTwo.score) {
                s.semiFinals[i].teamOne.penaltyScore = matchDetails.teamOne.penaltyScore;
                s.semiFinals[i].teamTwo.penaltyScore = matchDetails.teamTwo.penaltyScore; 
                s.semiFinals[i]['penalty'] = {
                    totalPenalties: 1
                }
                if(s.semiFinals[i].teamOne.penaltyScore>s.semiFinals[i].teamTwo.penaltyScore) {
                    s.semiFinals[i].teamOne.isWinner = true; 
                } else {
                    s.semiFinals[i].teamTwo.isWinner = true; 
                }
            }
            if(s.semiFinals[i].matchNumber==1) {
                s.final.teamOne.name = s.semiFinals[i].teamOne.isWinner?
                                                    s.semiFinals[i].teamOne.name:
                                                    s.semiFinals[i].teamTwo.name;
                s.final.teamOne.rank = s.semiFinals[i].teamOne.isWinner?
                                                    s.semiFinals[i].teamOne.rank:
                                                    s.semiFinals[i].teamTwo.rank;                                   
            }
            if(s.semiFinals[i].matchNumber==2) {
                s.final.teamTwo.name = s.semiFinals[i].teamOne.isWinner?
                                                    s.semiFinals[i].teamOne.name:
                                                    s.semiFinals[i].teamTwo.name;
                s.final.teamTwo.rank = s.semiFinals[i].teamOne.isWinner?
                                                    s.semiFinals[i].teamOne.rank:
                                                    s.semiFinals[i].teamTwo.rank;                                   
            }
        }
    }
    if(matchDetails.stage=='Final') {
            s.status = "Completed";
            s.final.date = matchDetails.date;
            s.final.teamOne.score = matchDetails.teamOne.score;
            s.final.teamTwo.score = matchDetails.teamTwo.score;
            s.final.status = matchDetails.status;
            if(s.final.teamOne.score>s.final.teamTwo.score) {
                s.final.teamOne.isWinner = true; 
            } else if(s.final.teamOne.score<s.final.teamTwo.score) {
                s.final.teamTwo.isWinner = true; 
            } else if(s.final.teamOne.score==s.final.teamTwo.score) {
                s.final.teamOne.penaltyScore = matchDetails.teamOne.penaltyScore;
                s.final.teamTwo.penaltyScore = matchDetails.teamTwo.penaltyScore; 
                s.final['penalty'] = {
                    totalPenalties: 1
                }
                if(s.final.teamOne.penaltyScore>s.final.teamTwo.penaltyScore) {
                    s.final.teamOne.isWinner = true; 
                } else {
                    s.final.teamTwo.isWinner = true; 
                }
            }
            let sindex = seasons.findIndex(ss=>ss.id==s.id);
            if(sindex>-1)seasons[sindex].status = "Completed";
    }
    seasonDetails.splice(jindex, 1, s);
}

const generateUuid = function() {
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

const seasonDetails = [
    {
        "id": "d51f21e3-d459-4762-bcf2-a03bc1f5d227",
        "name": "National League",
        "status": "Completed",
        "roundOf16": [
            {
                "matchNumber": 1,
                "stage": "Round of 16",
                "date": "2022-05-31T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Burkina",
                    "score": 1,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 1
                },
                "teamTwo": {
                    "name": "Gabon",
                    "score": 2,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 2
                },
                "id": "b83da3d8-4045-4aba-8908-13ac5b4df823"
            },
            {
                "matchNumber": 2,
                "stage": "Round of 16",
                "date": "2022-06-01T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Nigeria",
                    "score": 1,
                    "penaltyScore": 3,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 3
                },
                "teamTwo": {
                    "name": "Tunisia",
                    "score": 1,
                    "penaltyScore": 4,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 4
                },
                "id": "8ea7073d-3461-418f-ac98-4d7113921dfe",
                "penalty": {
                    "totalPenalties": 1
                }
            },
            {
                "matchNumber": 3,
                "stage": "Round of 16",
                "date": "2022-05-31T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Senegal",
                    "score": 2,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 5
                },
                "teamTwo": {
                    "name": "Cape Verde",
                    "score": 3,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 6
                },
                "id": "b359fd0b-d00b-4158-a6d2-039863e59e72"
            },
            {
                "matchNumber": 4,
                "stage": "Round of 16",
                "date": "2022-06-01T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Mali",
                    "score": 3,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 7
                },
                "teamTwo": {
                    "name": "Equitorial Country",
                    "score": 4,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 8
                },
                "id": "17ff1d0b-c8a6-4f76-ae5d-45a9bbbd9f57"
            },
            {
                "matchNumber": 5,
                "stage": "Round of 16",
                "date": "2022-05-31T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Guinea",
                    "score": 12,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 9
                },
                "teamTwo": {
                    "name": "Gambia",
                    "score": 3,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 10
                },
                "id": "10d66f69-7d9e-4c74-8c49-5ec10d2e52a4"
            },
            {
                "matchNumber": 6,
                "stage": "Round of 16",
                "date": "2022-06-01T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Cameroon",
                    "score": 2,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 11
                },
                "teamTwo": {
                    "name": "Comoros",
                    "score": 3,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 12
                },
                "id": "5aeccf59-b592-405c-848c-44a55b257c75"
            },
            {
                "matchNumber": 7,
                "stage": "Round of 16",
                "date": "2022-06-01T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Egypt",
                    "score": 2,
                    "penaltyScore": 3,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 13
                },
                "teamTwo": {
                    "name": "Test Country 1",
                    "score": 2,
                    "penaltyScore": 4,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 14
                },
                "id": "84067299-fc58-4fa3-8875-e1b20077f578",
                "penalty": {
                    "totalPenalties": 1
                }
            },
            {
                "matchNumber": 8,
                "stage": "Round of 16",
                "date": "2022-06-02T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Test Country 2",
                    "score": 1,
                    "penaltyScore": 3,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 15
                },
                "teamTwo": {
                    "name": "Test Country 3",
                    "score": 1,
                    "penaltyScore": 2,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 16
                },
                "id": "7e22ea1c-a02e-4352-9d7b-eb708919acba",
                "penalty": {
                    "totalPenalties": 1
                }
            }
        ],
        "quarterFinals": [
            {
                "matchNumber": 1,
                "stage": "Quarter Final",
                "date": "2022-06-14T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Gabon",
                    "score": 3,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 2
                },
                "teamTwo": {
                    "name": "Tunisia",
                    "score": 4,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 4
                },
                "id": "aad5d49b-570b-4180-a1e5-f06bc41622e7"
            },
            {
                "matchNumber": 2,
                "stage": "Quarter Final",
                "date": "2022-06-15T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Cape Verde",
                    "score": 2,
                    "penaltyScore": 3,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 6
                },
                "teamTwo": {
                    "name": "Equitorial Country",
                    "score": 2,
                    "penaltyScore": 4,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 8
                },
                "id": "1e877269-87fd-4bbc-a175-b81e9f519086",
                "penalty": {
                    "totalPenalties": 1
                }
            },
            {
                "matchNumber": 3,
                "stage": "Quarter Final",
                "date": "2022-06-16T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Guinea",
                    "score": 1,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 9
                },
                "teamTwo": {
                    "name": "Comoros",
                    "score": 3,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 12
                },
                "id": "b1f03f21-96aa-4491-92b2-39d85947beb3"
            },
            {
                "matchNumber": 4,
                "stage": "Quarter Final",
                "date": "2022-06-16T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Test Country 1",
                    "score": 3,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 14
                },
                "teamTwo": {
                    "name": "Test Country 2",
                    "score": 5,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 15
                },
                "id": "9857fb94-3c14-40be-bbef-0e7b6feea0bb"
            }
        ],
        "semiFinals": [
            {
                "matchNumber": 1,
                "stage": "Semi Final",
                "date": "2022-06-25T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Tunisia",
                    "score": 3,
                    "penaltyScore": 2,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 4
                },
                "teamTwo": {
                    "name": "Equitorial Country",
                    "score": 3,
                    "penaltyScore": 3,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 8
                },
                "id": "dcbdca87-5eb2-4363-bd0e-ba705deabeca",
                "penalty": {
                    "totalPenalties": 1
                }
            },
            {
                "matchNumber": 2,
                "stage": "Semi Final",
                "date": "2022-06-25T18:30:00.000Z",
                "status": "Full-time",
                "teamOne": {
                    "name": "Comoros",
                    "score": 5,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": true,
                    "rank": 12
                },
                "teamTwo": {
                    "name": "Test Country 2",
                    "score": 1,
                    "penaltyScore": 0,
                    "flag": "flag_circle",
                    "isWinner": false,
                    "rank": 15
                },
                "id": "fee6f8fa-fdbd-4e3c-92f7-01817f76ec5d"
            }
        ],
        "final": {
            "matchNumber": 1,
            "stage": "Final",
            "date": "2022-06-29T18:30:00.000Z",
            "status": "Full-time",
            "teamOne": {
                "name": "Equitorial Country",
                "score": 5,
                "penaltyScore": 4,
                "flag": "flag_circle",
                "isWinner": false,
                "rank": 8
            },
            "teamTwo": {
                "name": "Comoros",
                "score": 5,
                "penaltyScore": 5,
                "flag": "flag_circle",
                "isWinner": true,
                "rank": 12
            },
            "id": "e7850510-3078-4f00-863b-7a5331f2b34f",
            "penalty": {
                "totalPenalties": 1
            }
        }
    }
]

const blankTeam = {
    "name": "TBD",
    "score": 0,
    "penaltyScore": 0,
    "flag": "flag_circle",
    "isWinner": false,
    "rank": 0
}

const blankSeasonDetails = {
            "id": "",
            "name": "",
            "status": "",
            "roundOf16": [
                {
                    "matchNumber": 1,
                    "stage": "Round of 16",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                },
                {
                    "matchNumber": 2,
                    "stage": "Round of 16",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                },
                {
                    "matchNumber": 3,
                    "stage": "Round of 16",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                },
                {
                    "matchNumber": 4,
                    "stage": "Round of 16",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                },
                {
                    "matchNumber": 5,
                    "stage": "Round of 16",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                },
                {
                    "matchNumber": 6,
                    "stage": "Round of 16",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                },
                {
                    "matchNumber": 7,
                    "stage": "Round of 16",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                },
                {
                    "matchNumber": 8,
                    "stage": "Round of 16",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                }
            ],
            "quarterFinals": [
                {
                    "matchNumber": 1,
                    "stage": "Quarter Final",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                },
                {
                    "matchNumber": 2,
                    "stage": "Quarter Final",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                },
                {
                    "matchNumber": 3,
                    "stage": "Quarter Final",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                },
                {
                    "matchNumber": 4,
                    "stage": "Quarter Final",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                }
            ],
            "semiFinals": [
                {
                    "matchNumber": 1,
                    "stage": "Semi Final",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                },
                {
                    "matchNumber": 2,
                    "stage": "Semi Final",
                    "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
                }
            ],
            "final": {
                "matchNumber": 1,
                "stage": "Final",
                "date": "",
                    "status": "Inprogress",
                    "teamOne": JSON.parse(JSON.stringify(blankTeam)),
                    "teamTwo": JSON.parse(JSON.stringify(blankTeam))
            }
}

const seasons = [
    {
      "name": "National League",
      "status": "Completed",
      "id": "d51f21e3-d459-4762-bcf2-a03bc1f5d227"
    }
]

const players = [
    {
        "firstName": "Test",
        "lastName": "Player",
        "gender": "male",
        "birthDate": "1987-09-23T18:30:00.000Z",
        "id": "06d6eb1c-b820-4230-9814-0e1053882e4c",
        "team": {
            "id": "21a5970b-aa45-4f9e-abf1-2c66a185f3c5",
            "name": "Burkina",
            "rank": 1
        }
    },
    {
        "firstName": "Test",
        "lastName": "Player 1",
        "gender": "male",
        "birthDate": "1986-09-23T18:30:00.000Z",
        "id": "d4091f71-688e-45ca-8dd4-0f244f6bbf58",
        "team": {
            "id": "4551cd4e-04bd-46a1-b931-c5c873743c2b",
            "name": "Gabon",
            "rank": 2
        }
    }
]

const countries = [
    {
        "id": "afdfaf",
        "name": "Test Country 4",
        "rank": 17
    },
    {
        "id": "21a5970b-aa45-4f9e-abf1-2c66a185f3c5",
        "name": "Burkina",
        "rank": 1
    },
    {
        "id": "4551cd4e-04bd-46a1-b931-c5c873743c2b",
        "name": "Gabon",
        "rank": 2
    },
    {
        "id": "917d8aee-a4f7-46b9-8d0e-981857f74ec4",
        "name": "Nigeria",
        "rank": 3
    },
    {
        "id": "dfaa6569-9680-46e4-8a4f-9e54a1287008",
        "name": "Tunisia",
        "rank": 4
    },
    {
        "id": "4a0fb47b-dde4-47f2-b8ba-d1136483941f",
        "name": "Senegal",
        "rank": 5
    },
    {
        "id": "219be0b0-ea3e-4d96-b07e-d2b9c73a5aff",
        "name": "Cape Verde",
        "rank": 6
    },
    {
        "id": "bad57cc9-07f0-4cd1-9ead-ec57ad7d713b",
        "name": "Mali",
        "rank": 7
    },
    {
        "id": "2c15783e-f53a-45db-a047-c27e95158efd",
        "name": "Equitorial Country",
        "rank": 8
    },
    {
        "id": "e4bf0ca0-4e93-47bb-91ec-0e1562ed9168",
        "name": "Guinea",
        "rank": 9
    },
    {
        "id": "04ae96d3-6fba-4094-855d-14c5f458cf78",
        "name": "Gambia",
        "rank": 10
    },
    {
        "id": "abc22aab-f9d6-4298-92b0-01be05d62c3f",
        "name": "Cameroon",
        "rank": 11
    },
    {
        "id": "20cecd2a-8496-43ff-aaf3-0709230f201a",
        "name": "Comoros",
        "rank": 12
    },
    {
        "id": "f5d49a93-fb1d-40b9-bdf3-9d8a33559744",
        "name": "Egypt",
        "rank": 13
    },
    {
        "id": "4deef30e-70f6-4cfa-b8d7-209e0c6275f4",
        "name": "Test Country 1",
        "rank": 14
    },
    {
        "id": "7920b8f1-1df2-476c-921e-dd94ecbd5e37",
        "name": "Test Country 2",
        "rank": 15
    },
    {
        "id": "fc2d5298-3e6b-4fd8-83b5-37246ad2f766",
        "name": "Test Country 3",
        "rank": 16
    }
]

const matchDetails = [
    {
        "id": "b83da3d8-4045-4aba-8908-13ac5b4df823",
        "tournamentName": "National League",
        "date": "2022-05-31T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Round of 16",
        "teamOne": {
            "name": "Burkina",
            "flag": "flag_circle",
            "score": 1,
            "rank": 1,
            "stats": {
                "shots": 23,
                "shotsOnTarget": 1,
                "possession": 54,
                "passes": 24,
                "passAccuracy": 78,
                "fouls": 12,
                "yellowCards": 3
            },
            "penaltyScore": 0
        },
        "teamTwo": {
            "name": "Gabon",
            "flag": "flag_circle",
            "score": 2,
            "rank": 2,
            "stats": {
                "shots": 46,
                "shotsOnTarget": 2,
                "possession": 64,
                "passes": 45,
                "passAccuracy": 90,
                "fouls": 13,
                "yellowCards": 4
            },
            "penaltyScore": 0
        },
        "totalPenalty": 0
    },
    {
        "id": "8ea7073d-3461-418f-ac98-4d7113921dfe",
        "tournamentName": "National League",
        "date": "2022-06-01T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Round of 16",
        "teamOne": {
            "name": "Nigeria",
            "flag": "flag_circle",
            "score": 1,
            "rank": 3,
            "stats": {
                "shots": 23,
                "shotsOnTarget": 1,
                "possession": 65,
                "passes": 12,
                "passAccuracy": 66,
                "fouls": 12,
                "yellowCards": 2
            },
            "penaltyScore": 3
        },
        "teamTwo": {
            "name": "Tunisia",
            "flag": "flag_circle",
            "score": 1,
            "rank": 4,
            "stats": {
                "shots": 43,
                "shotsOnTarget": 1,
                "possession": 75,
                "passes": 34,
                "passAccuracy": 75,
                "fouls": 23,
                "yellowCards": 3
            },
            "penaltyScore": 4
        },
        "totalPenalty": 0
    },
    {
        "id": "b359fd0b-d00b-4158-a6d2-039863e59e72",
        "tournamentName": "National League",
        "date": "2022-05-31T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Round of 16",
        "teamOne": {
            "name": "Senegal",
            "flag": "flag_circle",
            "score": 2,
            "rank": 5,
            "stats": {
                "shots": 23,
                "shotsOnTarget": 2,
                "possession": 45,
                "passes": 12,
                "passAccuracy": 67,
                "fouls": 1,
                "yellowCards": 2
            },
            "penaltyScore": 0
        },
        "teamTwo": {
            "name": "Cape Verde",
            "flag": "flag_circle",
            "score": 3,
            "rank": 6,
            "stats": {
                "shots": 43,
                "shotsOnTarget": 3,
                "possession": 65,
                "passes": 54,
                "passAccuracy": 97,
                "fouls": 2,
                "yellowCards": 3
            },
            "penaltyScore": 0
        },
        "totalPenalty": 0
    },
    {
        "id": "17ff1d0b-c8a6-4f76-ae5d-45a9bbbd9f57",
        "tournamentName": "National League",
        "date": "2022-06-01T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Round of 16",
        "teamOne": {
            "name": "Mali",
            "flag": "flag_circle",
            "score": 3,
            "rank": 7,
            "stats": {
                "shots": 33,
                "shotsOnTarget": 3,
                "possession": 67,
                "passes": 34,
                "passAccuracy": 67,
                "fouls": 2,
                "yellowCards": 3
            },
            "penaltyScore": 0
        },
        "teamTwo": {
            "name": "Equitorial Country",
            "flag": "flag_circle",
            "score": 4,
            "rank": 8,
            "stats": {
                "shots": 43,
                "shotsOnTarget": 4,
                "possession": 76,
                "passes": 44,
                "passAccuracy": 77,
                "fouls": 2,
                "yellowCards": 4
            },
            "penaltyScore": 0
        },
        "totalPenalty": 0
    },
    {
        "id": "10d66f69-7d9e-4c74-8c49-5ec10d2e52a4",
        "tournamentName": "National League",
        "date": "2022-05-31T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Round of 16",
        "teamOne": {
            "name": "Guinea",
            "flag": "flag_circle",
            "score": 12,
            "rank": 9,
            "stats": {
                "shots": 45,
                "shotsOnTarget": 12,
                "possession": 78,
                "passes": 56,
                "passAccuracy": 90,
                "fouls": 32,
                "yellowCards": 2
            },
            "penaltyScore": 0
        },
        "teamTwo": {
            "name": "Gambia",
            "flag": "flag_circle",
            "score": 3,
            "rank": 10,
            "stats": {
                "shots": 12,
                "shotsOnTarget": 3,
                "possession": 43,
                "passes": 23,
                "passAccuracy": 54,
                "fouls": 35,
                "yellowCards": 1
            },
            "penaltyScore": 0
        },
        "totalPenalty": 0
    },
    {
        "id": "5aeccf59-b592-405c-848c-44a55b257c75",
        "tournamentName": "National League",
        "date": "2022-06-01T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Round of 16",
        "teamOne": {
            "name": "Cameroon",
            "flag": "flag_circle",
            "score": 2,
            "rank": 11,
            "stats": {
                "shots": 12,
                "shotsOnTarget": 2,
                "possession": 56,
                "passes": 12,
                "passAccuracy": 56,
                "fouls": 12,
                "yellowCards": 3
            },
            "penaltyScore": 0
        },
        "teamTwo": {
            "name": "Comoros",
            "flag": "flag_circle",
            "score": 3,
            "rank": 12,
            "stats": {
                "shots": 34,
                "shotsOnTarget": 3,
                "possession": 76,
                "passes": 34,
                "passAccuracy": 67,
                "fouls": 23,
                "yellowCards": 4
            },
            "penaltyScore": 0
        },
        "totalPenalty": 0
    },
    {
        "id": "84067299-fc58-4fa3-8875-e1b20077f578",
        "tournamentName": "National League",
        "date": "2022-06-01T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Round of 16",
        "teamOne": {
            "name": "Egypt",
            "flag": "flag_circle",
            "score": 2,
            "rank": 13,
            "stats": {
                "shots": 12,
                "shotsOnTarget": 2,
                "possession": 67,
                "passes": 23,
                "passAccuracy": 56,
                "fouls": 1,
                "yellowCards": 2
            },
            "penaltyScore": 3
        },
        "teamTwo": {
            "name": "Test Country 1",
            "flag": "flag_circle",
            "score": 2,
            "rank": 14,
            "stats": {
                "shots": 23,
                "shotsOnTarget": 2,
                "possession": 78,
                "passes": 34,
                "passAccuracy": 67,
                "fouls": 2,
                "yellowCards": 3
            },
            "penaltyScore": 4
        },
        "totalPenalty": 0
    },
    {
        "id": "7e22ea1c-a02e-4352-9d7b-eb708919acba",
        "tournamentName": "National League",
        "date": "2022-06-02T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Round of 16",
        "teamOne": {
            "name": "Test Country 2",
            "flag": "flag_circle",
            "score": 1,
            "rank": 15,
            "stats": {
                "shots": 12,
                "shotsOnTarget": 1,
                "possession": 78,
                "passes": 12,
                "passAccuracy": 56,
                "fouls": 1,
                "yellowCards": 1
            },
            "penaltyScore": 3
        },
        "teamTwo": {
            "name": "Test Country 3",
            "flag": "flag_circle",
            "score": 1,
            "rank": 16,
            "stats": {
                "shots": 32,
                "shotsOnTarget": 1,
                "possession": 88,
                "passes": 34,
                "passAccuracy": 78,
                "fouls": 2,
                "yellowCards": 3
            },
            "penaltyScore": 2
        },
        "totalPenalty": 0
    },
    {
        "id": "aad5d49b-570b-4180-a1e5-f06bc41622e7",
        "tournamentName": "National League",
        "date": "2022-06-14T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Quarter Final",
        "teamOne": {
            "name": "Gabon",
            "flag": "flag_circle",
            "score": 3,
            "rank": 2,
            "stats": {
                "shots": 12,
                "shotsOnTarget": 3,
                "possession": 45,
                "passes": 23,
                "passAccuracy": 45,
                "fouls": 1,
                "yellowCards": 12
            },
            "penaltyScore": 0
        },
        "teamTwo": {
            "name": "Tunisia",
            "flag": "flag_circle",
            "score": 4,
            "rank": 4,
            "stats": {
                "shots": 34,
                "shotsOnTarget": 4,
                "possession": 66,
                "passes": 45,
                "passAccuracy": 55,
                "fouls": 2,
                "yellowCards": 2
            },
            "penaltyScore": 0
        },
        "totalPenalty": 0
    },
    {
        "id": "1e877269-87fd-4bbc-a175-b81e9f519086",
        "tournamentName": "National League",
        "date": "2022-06-15T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Quarter Final",
        "teamOne": {
            "name": "Cape Verde",
            "flag": "flag_circle",
            "score": 2,
            "rank": 6,
            "stats": {
                "shots": 23,
                "shotsOnTarget": 3,
                "possession": 45,
                "passes": 34,
                "passAccuracy": 56,
                "fouls": 3,
                "yellowCards": 2
            },
            "penaltyScore": 3
        },
        "teamTwo": {
            "name": "Equitorial Country",
            "flag": "flag_circle",
            "score": 2,
            "rank": 8,
            "stats": {
                "shots": 45,
                "shotsOnTarget": 4,
                "possession": 55,
                "passes": 45,
                "passAccuracy": 55,
                "fouls": 4,
                "yellowCards": 3
            },
            "penaltyScore": 4
        },
        "totalPenalty": 0
    },
    {
        "id": "b1f03f21-96aa-4491-92b2-39d85947beb3",
        "tournamentName": "National League",
        "date": "2022-06-16T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Quarter Final",
        "teamOne": {
            "name": "Guinea",
            "flag": "flag_circle",
            "score": 1,
            "rank": 9,
            "stats": {
                "shots": 23,
                "shotsOnTarget": 2,
                "possession": 56,
                "passes": 23,
                "passAccuracy": 55,
                "fouls": 3,
                "yellowCards": 1
            },
            "penaltyScore": 0
        },
        "teamTwo": {
            "name": "Comoros",
            "flag": "flag_circle",
            "score": 3,
            "rank": 12,
            "stats": {
                "shots": 34,
                "shotsOnTarget": 3,
                "possession": 55,
                "passes": 32,
                "passAccuracy": 45,
                "fouls": 4,
                "yellowCards": 3
            },
            "penaltyScore": 0
        },
        "totalPenalty": 0
    },
    {
        "id": "9857fb94-3c14-40be-bbef-0e7b6feea0bb",
        "tournamentName": "National League",
        "date": "2022-06-16T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Quarter Final",
        "teamOne": {
            "name": "Test Country 1",
            "flag": "flag_circle",
            "score": 3,
            "rank": 14,
            "stats": {
                "shots": 12,
                "shotsOnTarget": 3,
                "possession": 56,
                "passes": 34,
                "passAccuracy": 56,
                "fouls": 3,
                "yellowCards": 2
            },
            "penaltyScore": 0
        },
        "teamTwo": {
            "name": "Test Country 2",
            "flag": "flag_circle",
            "score": 5,
            "rank": 15,
            "stats": {
                "shots": 33,
                "shotsOnTarget": 4,
                "possession": 44,
                "passes": 33,
                "passAccuracy": 44,
                "fouls": 4,
                "yellowCards": 4
            },
            "penaltyScore": 0
        },
        "totalPenalty": 0
    },
    {
        "id": "dcbdca87-5eb2-4363-bd0e-ba705deabeca",
        "tournamentName": "National League",
        "date": "2022-06-25T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Semi Final",
        "teamOne": {
            "name": "Tunisia",
            "flag": "flag_circle",
            "score": 3,
            "rank": 4,
            "stats": {
                "shots": 23,
                "shotsOnTarget": 3,
                "possession": 56,
                "passes": 23,
                "passAccuracy": 56,
                "fouls": 4,
                "yellowCards": 20
            },
            "penaltyScore": 2
        },
        "teamTwo": {
            "name": "Equitorial Country",
            "flag": "flag_circle",
            "score": 3,
            "rank": 8,
            "stats": {
                "shots": 33,
                "shotsOnTarget": 3,
                "possession": 44,
                "passes": 32,
                "passAccuracy": 44,
                "fouls": 3,
                "yellowCards": 3
            },
            "penaltyScore": 3
        },
        "totalPenalty": 0
    },
    {
        "id": "fee6f8fa-fdbd-4e3c-92f7-01817f76ec5d",
        "tournamentName": "National League",
        "date": "2022-06-25T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Semi Final",
        "teamOne": {
            "name": "Comoros",
            "flag": "flag_circle",
            "score": 5,
            "rank": 12,
            "stats": {
                "shots": 23,
                "shotsOnTarget": 5,
                "possession": 43,
                "passes": 23,
                "passAccuracy": 45,
                "fouls": 2,
                "yellowCards": 1
            },
            "penaltyScore": 0
        },
        "teamTwo": {
            "name": "Test Country 2",
            "flag": "flag_circle",
            "score": 1,
            "rank": 15,
            "stats": {
                "shots": 43,
                "shotsOnTarget": 1,
                "possession": 57,
                "passes": 33,
                "passAccuracy": 55,
                "fouls": 3,
                "yellowCards": 0
            },
            "penaltyScore": 0
        },
        "totalPenalty": 0
    },
    {
        "id": "e7850510-3078-4f00-863b-7a5331f2b34f",
        "tournamentName": "National League",
        "date": "2022-06-29T18:30:00.000Z",
        "status": "Full-time",
        "stage": "Final",
        "teamOne": {
            "name": "Equitorial Country",
            "flag": "flag_circle",
            "score": 5,
            "rank": 8,
            "stats": {
                "shots": 23,
                "shotsOnTarget": 4,
                "possession": 48,
                "passes": 34,
                "passAccuracy": 43,
                "fouls": 12,
                "yellowCards": 3
            },
            "penaltyScore": 4
        },
        "teamTwo": {
            "name": "Comoros",
            "flag": "flag_circle",
            "score": 5,
            "rank": 12,
            "stats": {
                "shots": 55,
                "shotsOnTarget": 5,
                "possession": 52,
                "passes": 23,
                "passAccuracy": 57,
                "fouls": 22,
                "yellowCards": 2
            },
            "penaltyScore": 5
        },
        "totalPenalty": 0
    }
];
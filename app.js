const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null
app.use(express.json())
const InitializeAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB error: ${error.message}`)
    process.exit(1)
  }
}
InitializeAndServer();
const convertDbToResObj=(dbObject)=>{
     return{
      playerId:dbObject.player_id,
      playerName:dbObject.player_name,
      jerseyNumber:dbObject.jersey_number,
      role:dbObject.role,
     };
};

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
   select * 
   from
    cricket_team `
  const playerarr = await db.all(getPlayersQuery)
  response.send(playerarr.map((eachplayer)=>
   convertDbToResObj(eachplayer)
  )
  );
});

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
insert into cricket_team(player_name,jersey_number,role)values(
  '${playerName}',
  ${jerseyNumber},
  '${role}'
);`
  const player = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuery = `
    SELECT
     *
    FROM
     cricket_team 
    WHERE
      player_id = ${playerId};`
  const playerArray = await db.get(getPlayersQuery)
  response.send(convertDbToResObj(playerArray))
});

//update

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const updateplayerDetails = request.body
  const {playerName, jerseyNumber, role} = updateplayerDetails
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
    player_name='${playerName}'
      jersey_number=${jerseyNumber},
    role= '${role}'
    WHERE
      player_id = ${playerId};`
  await db.run(updatePlayerQuery)
  response.send("Player Details Update")
})

//delete

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  await db.run(deleteplayerQuery)
  response.send('Player Removed')
})
module.exports = app;

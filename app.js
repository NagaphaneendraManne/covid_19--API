const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

//API 1
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT * FROM state`;
  const statesArray = await db.all(getStatesQuery);
  response.send(statesArray);
});

//API 2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = ` SELECT * FROM state WHERE state_id = ${stateId};`;
  const state = await db.get(getStateQuery);
  response.send(state);
});

//API 3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDistrictQuery = `
    INSERT INTO
      districts (district_name,
   state_id,
    cases,cured,active,deaths)
    VALUES(
        '${districtName}',
         ${stateId},
         ${cases},
         ${cured},
         ${active},
         ${deaths};`;
  const district = await db.run(addDistrictQuery);
  response.send("District Successfully Added");
});

//API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = ` SELECT * FROM district WHERE district_id = ${districtId};`;
  const district = await db.get(getDistrictQuery);
  response.send(district);
});

//API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM
     district
    WHERE
     district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictQuery = `
    UPDATE
      district
    SET
      district_name=${districtName},
      state_id = ${stateId},
      cases = ${cases},
       cured = ${cured},
        active = ${active},
      deaths = ${deaths}
      WHERE
      district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("district Details Updated");
});

//API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const statsQuery = `
    SELECT
    count(cases)AS totalCases,
    count(cured)AS totalCured,
    count(active)AS totalActive,
    count(deaths)AS totalDeaths
    FROM
    state
    WHERE state_id = ${stateId};`;
  const stats = await db.get(statsQuery);
  response.send(stats);
});

//API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const detailsQuery = `
    SELECT
    state_name 
    FROM 
    district
    WHERE
    district_id = ${districtId};`;
  const details = await db.get(detailsQuery);
  response.send(details);
});
module.exports = app;

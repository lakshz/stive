const express = require("express");
const router = express.Router();
const axios = require("axios");
const User = require("../models/user");
const orgId = process.env.DYTE_ORG_ID;
const apiKey = process.env.DYTE_API_KEY;
const baseURL = process.env.DYTE_API_BASE_URL;
const auth = require("../middleware/auth");
router.get("/host/:id", auth, async function (req, res, next) {
  //1. Get the meeting ID from the request

  const meetingId = req.query.meetingId;
  const roomName = req.query.roomName;

  //2. Make a call to create a participant with role `host`.
  //   `host` and `participant` roles are added by default to org.
  const resp = await axios.post(
    `${baseURL}/v1/organizations/${orgId}/meetings/${meetingId}/participant`,
    {
      clientSpecificId: Math.random().toString(36).substring(7),
      userDetails: {
        name: req.user.fullname,
      },
      roleName: "host",
    },
    {
      headers: {
        Authorization: `APIKEY ${apiKey}`,
      },
    }
  );

  //3. Pass the relevant details to the page with client SDK
  const authResponse = resp.data.data.authResponse;
  const authToken = authResponse.authToken;
  res.render("live", {
    id: req.params.id,
    type: "teacher",
    roomName,
    authToken,
    orgId,
    baseURL,
  });
});

router.get("/participant/:id", auth, async function (req, res, next) {
  //1. Get the meeting ID from the request
  const meetingId = req.query.meetingId;
  const roomName = req.query.roomName;

  //2. Make a call to create a participant
  const resp = await axios.post(
    `${baseURL}/v1/organizations/${orgId}/meetings/${meetingId}/participant`,
    {
      clientSpecificId: Math.random().toString(36).substring(7),
      userDetails: {
        name: req.user.fullname,
      },
    },
    {
      headers: {
        Authorization: `APIKEY ${apiKey}`,
      },
    }
  );

  //3. Pass the relevant details to the page with client SDK
  const authResponse = resp.data.data.authResponse;
  const authToken = authResponse.authToken;
  res.render("live", {
    type: "teacher",
    id: req.params.id,
    roomName,
    authToken,
    orgId,
    baseURL,
  });
});

module.exports = router;

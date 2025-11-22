const express = require("express");
const { ZKPassport } = require("@zkpassport/sdk");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/register", async (req, res) => {
  const { email, password, verification } = req.body;
  // validation ...
  const zkPassport = new ZKPassport("localhost"); // **IMPORTANT**: domain

  const { verified, queryResultErrors, uniqueIdentifier } = await zkPassport.verify({
    proofs: verification.proofs,
    queryResult: verification.queryResult,
    devMode: true,
  });

  if (!verified) {
    return res.status(400).json({ success: false, error: "Verification failed" });
  }

  // Extract fields:
  const nationality = verification.queryResult.nationality?.disclose?.result;

  // Simulate "create user"
  const user = { email, id: uniqueIdentifier, nationality }; // Replace with real DB logic

  return res.json({ success: true, userId: uniqueIdentifier });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));

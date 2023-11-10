// run.js: Runs the main web app server API.

// Imports
var turn = require('node-turn');

// Database
var database = require('../database.js');
var errorMiddleware = require('../middlewares/helpers/error');

// Run app
function runApp(app) {
    // Test
    app.all("/api/test", (req, res) => {
        res.status(200).json({"response": "ok"});
    });

    // Load
    app.all("/api/load", (req, res) => {
        try {
            // Query data owned by this user
            if (!req.user) return res.send({"response": "not logged in"});
            var query = "SELECT * FROM times WHERE owner_id == ?";
            var owner_id = req.user.id;
            var params = [owner_id];

            // Owner ID 1 admin gets all user data
            if (owner_id == 1) {
                query = "SELECT * FROM times";
                params = [];
            }

            // Query
            database.all(query, params, (err, rows) => {
                if (err) { console.log(err); return res.status(400).json({"error": err.message}); }
                res.json({
                    "response": "ok",
                    "data": rows,
                    "username": req.user.username,
                    "id": req.user.id
                })
            });
        }
        catch (e) {
            console.log(e);
            res.send({"response": "not ok"});
        }
    });

    // Save
    app.all('/api/save', (req, res) => {
        try {
            if (!req.user) return res.send({"response": "not logged in"});
            var owner_id = req.user.id;
            var email = req.user.username;
            var status = req.query.status;
            var dateNum = req.query.date.substr(0, 2);
            var monthNum = req.query.date.substr(3);
            var date = "2022-" + monthNum + "-" + dateNum;
            var time = req.query.time + ":00:00";
            var timezone = "EST";
            var datetime = date + " " + time + " " + timezone;
            console.log("Saving " + req.query.date + " " + req.query.time + "h, datetime: " + datetime + ", status: " + status);
            var query = 'REPLACE INTO times (owner_id, username, time, status) VALUES (?, ?, ?, ?)';
            database.run(query, [owner_id, email, datetime, status]);
            res.send({"response": "ok"});
        }
        catch (e) {
            console.log(e);
            res.send({"response": "not ok"});
        }
    });
}

// Start turn server
var server = new turn({
  authMech: 'long-term',
  credentials: {
    username: "password"
  }
});
server.start();

// Export
module.exports = runApp;

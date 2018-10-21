// SETUP

var express = require("express");

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 8889,
    user: "root",
    password: "root",
    database: "burgers_db"
});

connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }

    console.log("connected as id " + connection.threadId);
});

// =========================================================

// ROUTES

app.get("/burgers", function (req, res) {
    connection.query("SELECT * FROM burgers WHERE devoured = false", function (err, result1) {
        if (err) {
            throw err;
        }
        connection.query("SELECT * FROM burgers WHERE devoured = true", function (err, result2) {
            if (err) {
                throw err;
            }
            console.log(result1, result2);
            res.render("index",
            {
                notDevoured: result1,
                devoured: result2
            })
        });
    });
})

app.post("/burgers", function (req, res) {
    connection.query("INSERT INTO burgers (burger_name) VALUES (?)", [req.body.burger], function (err, result) {
        if (err) {
            throw err;
        }

        res.redirect("/burgers");
    });
});

app.put("/burgers/:id", function(req, res) {
    connection.query("UPDATE burgers SET devour = true WHERE id = ?", [req.params.id], function(err, result) {
      if (err) {
        // If an error occurred, send a generic server failure
        return res.status(500).end();
      }
      else if (result.changedRows === 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      }
      res.reload();
    });
  });

// CATCH ALL
// app.get("*", function(req, res) {
//     res.render("index",)
// })
// =========================================================

// LISTENER

app.listen(PORT, function () {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
});

// =========================================================

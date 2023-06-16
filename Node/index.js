// Require the express web application framework (https://expressjs.com)
var express = require('express')
var app = express()
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
const bodyParser = require('body-parser');

app.use(express.urlencoded({ extended: false }));
// Set the view engine to EJS
app.set('view engine', 'ejs');
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Parse JSON bodies
app.use(bodyParser.json());
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS dKinNews_User (ID INTEGER PRIMARY KEY AUTOINCREMENT,Username TEXT,Password TEXT,Full_Name TEXT)');

  db.run(`INSERT INTO dKinNews_User (Username, Password, Full_Name) VALUES ("mickeym@deakin.edu.au", "cheese123", "Mickey Mouse")`);
  db.run(`INSERT INTO dKinNews_User (Username, Password, Full_Name) VALUES ("alfred", "pm1903aus", "Alfred Deakin")`);
  db.run(`INSERT INTO dKinNews_User (Username, Password, Full_Name) VALUES ("jane", "qwerty", "Jane Smith")`);
  db.run(`INSERT INTO dKinNews_User (Username, Password, Full_Name) VALUES ("john", "brian1979", "John Cleese")`);
  db.run(`INSERT INTO dKinNews_User (Username, Password, Full_Name) VALUES ("terry", "montyp1969", "Terry Jones")`);

  db.run('CREATE TABLE IF NOT EXISTS dKinNews_Stories (ID INTEGER PRIMARY KEY AUTOINCREMENT, Headline TEXT, Content TEXT, WrittenBy INTEGER, FOREIGN KEY (WrittenBy) REFERENCES dKinNews_User(ID))');
  db.run(`INSERT INTO dKinNews_Stories (Headline, Content, WrittenBy) VALUES ("Eight Killed in shooting", "A police officer on an unrelated call at the mall in Allen killed the gunman after
              hearing shots.", 1)`);
  db.run(`INSERT INTO dKinNews_Stories (Headline, Content, WrittenBy) VALUES ("King Charles Coronation", "The King was coronated at the age of 75.", 1)`);
  db.run(`INSERT INTO dKinNews_Stories (Headline, Content, WrittenBy) VALUES ("Alvarez dominates Ryder in Mexico Homecoming", "", 1)`);
  db.run(`INSERT INTO dKinNews_Stories (Headline, Content, WrittenBy) VALUES ("What side-hustlers are really making", "", 1)`);
  db.run(`INSERT INTO dKinNews_Stories (Headline, Content, WrittenBy) VALUES ("The real meaning of carne asada", "", 2)`);

  db.run('CREATE TABLE IF NOT EXISTS dKinNews_Comments (ID INTEGER PRIMARY KEY AUTOINCREMENT, Content TEXT, CommentTime Date DEFAULT CURRENT_TIMESTAMP, WrittenBy INTEGER, CommentedOn INTEGER,FOREIGN KEY (CommentedOn) REFERENCES dKinNews_Stories(ID), FOREIGN KEY (WrittenBy) REFERENCES dKinNews_User(ID))');
  db.run(`INSERT INTO dKinNews_Comments (Content,CommentTime, WrittenBy, CommentedOn) VALUES ("Test comment", CURRENT_TIMESTAMP, 1,1)`);
  db.run(`INSERT INTO dKinNews_Comments (Content,CommentTime, WrittenBy, CommentedOn) VALUES ("No way. what has become of society?!", CURRENT_TIMESTAMP, 1,1)`);
  db.run(`INSERT INTO dKinNews_Comments (Content,CommentTime, WrittenBy, CommentedOn) VALUES ("Test comment", CURRENT_TIMESTAMP, 1,3)`);

});

app.post('/users', function (req, res, next) {
  let Username = req.body.userEmail;
  let pwd = req.body.UserPassword;

  console.log("Just received POST data for users endpoint!");
  console.log(`Data includes: ${Username}, ${pwd}`);

  //validate entry
  const query = `SELECT * FROM dKinNews_User WHERE Username = ? AND Password = ?`;
  db.get(query, [Username, pwd], (err, row) => {
    if (err) {
      console.error(err);
      res.send('An error occurred during login.');
    } else {
      if (row) {
        console.log(row);
        var HeadHTML = `
        <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="./main.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://getbootstrap.com/docs/5.3/assets/css/docs.css" rel="stylesheet">
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
  <title>5.3</title>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
</head>
        `
        var navbarHTML = `  <nav class="navbar fixed-top navbar-expand-lg navbar-dark bd-red-600">
    <a class="navbar-brand" href="./index.html">
      <!--Navbar has a blue buttery icon to match with website theme-->
      <img
        src="data:image/png;base64,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"
        width="60" height="60">
    </a>
    <button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
      aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item" style="padding-right: 20px;">
          <a class="navbar-brand active" href="./Sport.html">Sport</a>
        </li>
        <li class="nav-item" style="padding-right: 20px;">
          <a class="navbar-brand" href="./News.html">News</a>
        </li>
        <li class="nav-item" style="padding-right: 20px;">
          <a class="navbar-brand" href="./Worklife.html">Worklife</a>
        </li>
        <li class="nav-item" style="padding-right: 20px;">
          <a class="navbar-brand" href="./Travel.html">Travel</a>
        </li>
      </ul>
      <form class="d-flex" role="search">
        <div class="input-group col-sm">
          <div class="input-group-text"><span class="material-symbols-outlined">search</span></div>
          <input class=" me-2" type="text" placeholder="Search" aria-label="Search">
        </div>
        <button class="btn btn-light" type="button">Search</button>
        <button class="btn btn-light  ">
          <a href="./signin.html"><span class="material-symbols-outlined">person</span></a>
        </button>
      </form>
  
    </div>
  </nav>`
        let html = "";
        html += "<h1> Login Successful</h1>";
        html += "<p> Thank you " + row.Full_Name + "(Username: " + row.Username + ")" + " your login has been succesful</p>";
        console.log('Login successful!');
        navbarHTML += html;
        HeadHTML += navbarHTML;
        res.send(HeadHTML);
      } else {
        console.log('Invalid username or password.')
        res.send('Invalid username or password.');
      }
    }
  });
});


app.post('/search', function (req, res, next) {
  let Search = req.body.Search;

  console.log("Just received POST data for users endpoint!");
  console.log(`Data includes: ${Search}`);

  //validate entry
  const query = `SELECT * FROM dKinNews_Stories WHERE Headline LIKE '%' || ? || '%'`;
  db.all(query, [Search], (err, row) => {
    if (err) {
      console.error(err);
      res.send('An error occurred during login.');
    } else {
      if (row.length > 0) {
        console.log(row);
        var HeadHTML = `
        <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="./main.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://getbootstrap.com/docs/5.3/assets/css/docs.css" rel="stylesheet">
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0" />
  <title>5.3</title>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"></script>
</head>
        `
        var navbarHTML = `  <nav class="navbar fixed-top navbar-expand-lg navbar-dark bd-red-600">
    <a class="navbar-brand" href="./index.html">
      <!--Navbar has a blue buttery icon to match with website theme-->
      <img
        src="data:image/png;base64,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"
        width="60" height="60">
    </a>
    <button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
      aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item" style="padding-right: 20px;">
          <a class="navbar-brand active" href="./Sport.html">Sport</a>
        </li>
        <li class="nav-item" style="padding-right: 20px;">
          <a class="navbar-brand" href="./News.html">News</a>
        </li>
        <li class="nav-item" style="padding-right: 20px;">
          <a class="navbar-brand" href="./Worklife.html">Worklife</a>
        </li>
        <li class="nav-item" style="padding-right: 20px;">
          <a class="navbar-brand" href="./Travel.html">Travel</a>
        </li>
      </ul>
      <form class="d-flex" role="search">
        <div class="input-group col-sm">
          <div class="input-group-text"><span class="material-symbols-outlined">search</span></div>
          <input class=" me-2" type="text" placeholder="Search" aria-label="Search">
        </div>
        <button class="btn btn-light" type="button">Search</button>
        <button class="btn btn-light  ">
          <a href="./signin.html"><span class="material-symbols-outlined">person</span></a>
        </button>
      </form>
  
    </div>
  </nav>`
        row.forEach(function (Story)
        {
          var html =
            `
                  <div class="row">
          <div class="card">
            <div class="card-body">
              <blockquote class="blockquote mb-0">
                <p>${Story.Headline}</p>
                <footer class="blockquote-footer"><cite title="Source Title"><a href="./index.html"> Headline </a></cite>
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
          `
          navbarHTML += html;

        });

        HeadHTML += navbarHTML;
        res.send(HeadHTML);
      } else {
        console.log('No news found')
        res.send('No news found.');
      }
    }
  });
});

app.get('/', async (req, res) => {
  try {
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM dKinNews_Stories', (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
    //console.log("🚀 ~ file: index.js:298 ~ rows ~ rows:", rows)

    const storyData = [];

    for (const story of rows) {
      const query = `
        SELECT dKinNews_Comments.ID, dKinNews_Comments.Content, dKinNews_Comments.CommentTime, dKinNews_Comments.WrittenBy, dKinNews_Comments.CommentedOn FROM dKinNews_Comments 
        INNER JOIN dKinNews_Stories ON dKinNews_Comments.CommentedOn = dKinNews_Stories.ID  
        WHERE CommentedOn = ?`;

      const rows2 = await new Promise((resolve, reject) => {
        db.all(query, [story.ID], (err, rowsComments) => {
          //console.log("🚀 ~ file: index.js:309 ~ db.all ~ rowsComments:", rowsComments);
          if (err) {
            reject(err);
            return;
          }
          
          resolve(rowsComments);
        });
      });
      //console.log("🚀 ~ file: index.js:318 ~ rows2 ~ rows2:", rows2)

      const tempObj = { ...story, Comments: rows2 };
      storyData.push(tempObj);
      //console.log("🚀 ~ file: index.js:323 ~ app.get ~ tempObj:", JSON.stringify(tempObj));
    }

    console.log(JSON.stringify(storyData));
    res.render('index', { stories: storyData });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/PostComment', function (req, res, next) {
  console.log("🚀 ~ file: index.js:337 ~ req:", req.body)
  let Content = req.body.Content;
  let CommentedOn = req.body.CommentedOn;

  console.log("Just received POST data for PostComment endpoint!");
  console.log(`Data includes: ${Content}, ${CommentedOn}`);

  //validate entry
  const query = `INSERT INTO dKinNews_Comments (Content, CommentTime, WrittenBy, CommentedOn) VALUES (?, CURRENT_TIMESTAMP, 1, ?)`;
  db.run(query, [Content, CommentedOn], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to insert comment' });
    } else {
      res.status(200).json({ message: 'Comment inserted successfully' });
    }
  });

});



// Tell our application to serve all the files under the `public_html` directory
app.use(express.static('public_html'))

// Tell our application to listen to requests at port 3000 on the localhost
app.listen(port, function () {
  // When the application starts, print to the console that our app is
  // running at http://localhost:3000  (where the port number is 3000 by
  // default). Print another message indicating how to shut the server down.
  console.log(`Web server running at: http://localhost:${port}`)
  console.log("Type Ctrl+C to shut down the web server")
})

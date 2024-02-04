var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');

// sql connection
const mysql = require('mysql2');

const config = {
   host: 'localhost',
   user: 'root',
  password: '0001A',
  database: 'users_brainbox',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'html', 'home.html'));
});

app.get('/success', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'html', 'success.html'));
});

app.get('/stylesheets/style.css', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'stylesheets', 'style.css'));
});

//image access
app.get('/images/brain.png', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'images', 'brain.png'));
});

app.use('/users', usersRouter);

//**FORMS */
app.post('/submit', async (req, res) => {
  try {
    const { userName, passWord } = req.body;
    //dataField matches variable in home.html

    console.log('Received data from the client:', userName, passWord);

    // Connect to the database
    const connection = mysql.createConnection(config);

    // Check if the username and password combination already exists
    const [existingUsers] = await connection
      .promise()
      .query('SELECT * FROM users WHERE username = ? AND password = ?', [userName, passWord]);


    // Insert data into the database
    //await connection.promise().query('INSERT INTO testdata (data) VALUES (?)', [dataField]);
    if (existingUsers.length > 0) {
      // Username and password combination already exists
      res.redirect('/success');
    }
    // Close the connection pool
    connection.end();

    //res.send('Data submitted successfully!');
    //res.redirect('/success');
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).send('Internal Server Error');
  }
});




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

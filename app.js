const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const config = require('./config/database')
const passport = require('passport');
const session = require('express-session');

mongoose.connect(config.database);
let db = mongoose.connection;

//Check connection
db.once('open', function(){
    console.log('Connected to MongoDB');
})

//check for db errors
db.on('error',function(err){
    console.log(err);
});

// init app
const app = express();

// bring in models
let Articles = require('./models/article');

// Load view engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine','pug');

//Body parser middleware
//Parse applicatin/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}));
//parse application/json
app.use(bodyParser.json());

//Set public folder
app.use(express.static(path.join(__dirname,'public')));

//Express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }))

// Express Message Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express validator middleware
app.use(expressValidator({
    errorFormatter: function(param,msg,value){
        var namespace = param.split('.')
        ,root = namespace.shift()
        ,formParam = root;
    while(namespace.length){
        formParam += '['+ namespace.shift() +']'
    }
    return{
        param:formParam,
        msg:msg,
        value
    };
    }
}));

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next){
    res.locals.user = req.user || null;
    next();
})

//Home route
app.get('/',(req,res)=>{
    Articles.find({},function(err,articles){
        if (err){
            console.log(err);
        }else{
        res.render('index',{
            title: 'Article',
            articles : articles
        });
    };
});
});

// Route Files
let articles = require('./routes/article');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

//start server
app.listen(3000,()=>{
    console.log('Server Started on port 3000....')
})
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const bcrypt = require('bcryptjs');
const request = require("request");
const https = require("https");
var axios = require("axios").default;
var util=  require("util");


const initializePassport = require('./passport-config');
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);


const users = []; // This should be replaced with a database
let query = 'news';
app.use(express.static(__dirname + "/public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.listen(3000 || process.env.PORT, function () {
  console.log("Website is live on 3000 port");
});
var freeNewsHeadlineOption = {
    method: 'GET',
    url: 'https://free-news.p.rapidapi.com/v1/search',
    params: {q: `news`, lang: 'hi'},
    headers: {
      'x-rapidapi-host': 'free-news.p.rapidapi.com',
      'x-rapidapi-key': 'c8ef7897fbmshba5bd14ca66e3a7p1231ccjsn26c5202dd937'
    }
  };


  var newsApiHeadlinesOptions = {
    method: 'GET',
    url: `https://newsapi.org/v2/top-headlines?country=in&sortBy=publishedAt&apiKey=d5d893234f5a4e96b7f6b0d6629cda11`,
  };




  app.get("/searched",(req,res)=>{
     res.redirect("/");
  });
 
  app.post("/searched",(req,res)=>{  
      let query = req.body.query;
      // console.log(req.body.query);
      var newsApiQueryOptions = {
        method: 'GET',
        url: `https://newsapi.org/v2/everything?domains=news18.com,indianexpress.com,timesofindia.indiatimes.com,hindustantimes.com,scroll.in,ndtv.com,gadgets.ndtv.com,sports.ndtv.com,latestly.com,cnn.com,cnbctv18.com&q=${query}&sortBy=publishedAt&apiKey=d5d893234f5a4e96b7f6b0d6629cda11`
      }
      if(!req.body.query) res.redirect('/');
      var freeNewsQueryOption = {
        method: 'GET',
        url: 'https://free-news.p.rapidapi.com/v1/search',
        params: {q: query, lang: 'hi'},
        headers: {
          'x-rapidapi-host': 'free-news.p.rapidapi.com',
          'x-rapidapi-key': 'c8ef7897fbmshba5bd14ca66e3a7p1231ccjsn26c5202dd937'
        }
      }
      axios.request(freeNewsQueryOption).then(function (response) {
        let list=response.data.articles;  
          axios.request(newsApiQueryOptions).then(function (response) {
            let list2 = response.data.articles;
            list2.forEach(element => {
                element.published_date = element.publishedAt; delete element.publishedAt;
                element.link = element.url; delete element.url;
                element.media = element.urlToImage; delete element.urlToImage;
            });  
            console.log(list2);
            if(list)
            list2=list.concat(list2);
            if(list2)
            list2.sort((a, b) => (Date.parse(a.published_date) < Date.parse(b.published_date)) ? 1 : -1);
            res.render("Notifyme",{obj:list2});
          }).catch(function (error) {
            console.error(error);
          });


    }).catch(function (error) {
        console.error(error);
    });
  });


app.post("/",(req,res)=>{
    res.redirect("/");
})




app.get("/",(req,res)=>{
    axios.request(newsApiHeadlinesOptions).then(function (response) {
        let list=response.data.articles;
        let nullMediaIndexes=[];
        if(response.data.articles)
        list.forEach((element,index,list) => {
          if(element.urlToImage===null) nullMediaIndexes.push(index);


          else {
            element.published_date = element.publishedAt; delete element.publishedAt;
            element.link = element.url; delete element.url;
            element.media = element.urlToImage; delete element.urlToImage;
          }
      });  
      for(let i=0;nullMediaIndexes&&i<nullMediaIndexes.length;i++){
        list.splice(nullMediaIndexes[i]-i,1);
      }
             res.render("Notifyme",{obj:list,user:null});


    }).catch(function (error) {
        console.error(error);
    });
});




//auth
//const { checkAuthenticated, checkNotAuthenticated } = require('./auth-middleware');


app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login',{successmessage:null,errormessage:null});
});


app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));


app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register',{successmessage:null,errormessage:null});
});


app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    console.log('req body: ', req.body);
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    //alert('You are successfully registered, please login!!');
    console.log('You are successfully registered, please login!!');
    res.render('/login',{successmessage:'You are successfully registered, please login!!'});
  } catch(e) {
    //alert('Register failed!');
    console.log('Register failed!!');
    console.log(e);
    res.render('/register',{errormessage:'Register failed!!'});
  }
});


app.delete('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});


///////
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }
 
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    next();
  }
 
 // module.exports = { checkAuthenticated, checkNotAuthenticated };
 


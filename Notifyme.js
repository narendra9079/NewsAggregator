const express=require("express");
const app=express();   
const bodyparser = require("body-parser");
const request = require("request");
const https = require("https"); 
var axios = require("axios").default; 
var util=  require("util");
const { log } = require("console");


let query = 'news';
app.use(express.static(__dirname+"/public")); 
app.set('view engine', 'ejs') 
app.use(bodyparser.urlencoded({extended:false}));

app.listen(3000||process.env.PORT,function(){
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
             res.render("Notifyme",{obj:list});

    }).catch(function (error) {
        console.error(error);
    });
});


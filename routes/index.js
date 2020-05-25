var express = require('express');
const fs = require('fs');
var path = require('path');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/post/:name', async function(req, res, next) {
  try{
    const content =  path.resolve(__dirname,'../content/posts/'+req.params.name+'.html');
    console.info('reading file', content);
    const promise = new Promise((resolve, reject)=>{
      fs.readFile(content, 'utf8', function (err,data) {
        if (err) {
          reject(new Error(err));
        }else{
          resolve(data);
        }
        
      });
    });
    const data = await promise;
    res.render('content', { title:'Im a page', content: data });
   
  }catch(e){
    next(e);
  }
  
});

module.exports = router;

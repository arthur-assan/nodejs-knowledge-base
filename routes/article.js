const express = require('express');
const router = express.Router();
const passport = require('passport');

// Article Models
let Articles = require('../models/article');

// User Models
let Users = require('../models/user');

//Add Routes
router.get('/add', ensureAuthenticated, (req,res)=>{
    res.render('add_article',{
        title: 'Add Article'
    });
});

//Add submit post request
router.post('/add',(req,res)=>{
   req.checkBody('title','Title is required').notEmpty();
   req.checkBody('body','Body is required').notEmpty(); 

   // Get Errors
   let errors = req.validationErrors();

   if(errors){
       res.render('add_article',{
           title:'Add Article',
           errors:errors
       });
   }else{
   let article = new Articles();
   article.title = req.body.title;
   article.author = req.user._id;
   article.body = req.body.body;

   article.save((err)=>{
       if(err){
           console.log(err);
           return;
       }else{
           req.flash('success','Article Added');
           res.redirect('/')
       }
   });
}
});

//Load Edit Form
router.get('/edit/:id',ensureAuthenticated, (req,res)=>{
    Articles.findById(req.params.id,(err,article)=>{
        if(article.author != req.user._id){
            req.flash('danger','Not Authorized');
            res.redirect('/');
        }else{
        res.render('edit_article',{
            title:'Edit Article',
            article:article
        });
    }
    });
});

//Update submit post request
router.post('/edit/:id',(req,res)=>{
    req.checkBody('title','Title is required').notEmpty();
    req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();

    //Get Errors
    let errors = req.validationErrors();

    if(errors){
        res.render('add_article',{
            title:'Add Article',
            errors:errors,
        });
    }else{
        let article = {};
        article.title = req.body.title;
        article.author = req.body.author;
        article.body = req.body.body;
    
        let query = {_id:req.params.id}
     
        Articles.update(query,article,(err)=>{
            if(err){
                console.log(err);
                return;
            }else{
                req.flash('success','Updated Successfully')
                res.redirect('/')
            }
        })
    }
 });
 
router.delete('/:id', function(req,res){
    if(!req.user._id){
        res.status(500).send();
    }

    let query = {_id:req.params.id}

    Article.findById(req.params.id,function(err,article){
        if(article.author != req.user._id){
            res.status(500).send();
        }else{
            Articles.remove(query,function(err){
                if(err){
                    console.log(err);
                }
                res.send('Success');
            });
        }
    });

});

//Get Single Article
router.get('/:id',(req,res)=>{
    Articles.findById(req.params.id,(err,article)=>{
        Users.findById(article.author,function(err,user){
            res.render('article',{
                article:article,
                author:user.name
            });
        });
    });
});

// Access Control
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger','Please login');
        res.redirect('/users/login');
    }
}
module.exports = router;

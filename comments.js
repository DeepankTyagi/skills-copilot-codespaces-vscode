// Create web server application 
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

// Import models
const Dishes = require('../models/dishes');
const Comments = require('../models/comments');

// Create router
const commentRouter = express.Router();

// Use body parser
commentRouter.use(bodyParser.json());

// Configure router for /comments
commentRouter.route('/')
// GET method for /comments
.get((req, res, next) => {
    // Find all comments
    Comments.find({})
    // Populate author
    .populate('author')
    .then((comments) => {
        // Send response
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comments);
    }, (err) => next(err))
    .catch((err) => next(err));
})
// POST method for /comments
.post(authenticate.verifyUser, (req, res, next) => {
    // Add author to request body
    req.body.author = req.user._id;
    // Create comment
    Comments.create(req.body)
    .then((comment) => {
        // Find dish
        Dishes.findById(comment.dish)
        .then((dish) => {
            // Add comment to dish
            dish.comments.push(comment._id);
            // Save dish
            dish.save()
            .then((dish) => {
                // Find comment
                Comments.findById(comment._id)
                .populate('author')
                .then((comment) => {
                    // Send response
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(comment);
                })
            })
        })
    }, (err) => next(err))
    .catch((err) => next(err));
})
// PUT method for /comments
.put(authenticate.verifyUser, (req, res, next) => {
    // Send response
    res.statusCode = 403;
    res.end('PUT operation not supported on /comments');
})
// DELETE method for /comments
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    // Remove all comments
    Comments.remove({})
    .then((resp) => {
        // Send response
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);

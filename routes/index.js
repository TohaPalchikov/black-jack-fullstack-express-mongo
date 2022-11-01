const express = require('express');
const mongoose = require("mongoose");
const TestSchema = module.exports
const router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
    res.send({title: "good"});
});

module.exports = router;

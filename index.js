const express = require('express')
const path = require('path')

const axios = require('axios')
const moment = require('moment')
var bodyParser = require('body-parser')
var { Parser } = require('json2csv')
const { enable } = require('express/lib/application')


var urlencodedParser = bodyParser.urlencoded({ extended: false })

const app = express()
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);
app.use(express.static(path.join(__dirname,'public')));


const port = 5000



app.get('/', (req, res) => {
    res.render(__dirname + '/index', {title: '', server: '', username: ''})
});

app.get('/tools', (req, res) => {
    res.render(__dirname + '/tools')
});

app.get('/departments', (req, res) => {
    res.render(__dirname + '/departments')
});

app.get('/users', (req, res) => {
    res.render(__dirname + '/users')
});

app.get('/livechat-rooms', (req, res) => {
    res.render(__dirname + '/livechat-rooms')
});

app.get('/channels', (req, res) => {
    res.render(__dirname + '/channels')
});


app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
		console.log('Go to browser and type: http://localhost:5000/export and see the magic happen :)')

})

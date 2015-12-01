var path = require('path');
var express = require('express');
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname);
app.use('/static/', express.static(path.join(__dirname, 'assets')));
app.use('/bower/', express.static(path.join(__dirname, 'bower_components')));
app.set('view engine', 'ejs');

app.listen(app.get('port'));

app.get('/', function(request, response) {
    response.render('index', {});
});

const express = require('express');
const exphbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
const mysql = require('mysql');
const fs = require('fs');
const { DATE } = require('mysql/lib/protocol/constants/types');

const app = express();
const port = process.env.PORT || 5000;

//default option
app.use(fileUpload());

//Static Files
app.use(express.static('public'));
app.use(express.static('upload'));

//templating engine
app.engine('hbs', exphbs.engine({ extname: '.hbs'}));
app.set('view engine', 'hbs');



//Connection Pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '702045369',
    database: 'userprofile'
});

pool.getConnection((err, connection)=> {
    if(err) throw err; //not connected
    console.log('Connected!');
});




app.get('', (req, res) => {


    pool.getConnection((err, connection)=> {
        if(err) throw err; //not connected
        console.log('Connected!');

        //ORDER BY postdate DESC
        connection.query('SELECT * FROM posts ORDER BY id DESC', (err, rows) => {
            //Once done, release connection
            connection.release();

                if(!err) {
                    res.render('index', { rows });
                }
        });




    });









});


app.post('', (req, res) => {
    let sampleFile;
    let uploadPath;
    let sampleFileDBname = '';

    if(req.files && !(Object.keys(req.files).length === 0)) {
        //name of the input is sampleFile
        sampleFile = req.files.sampleFile;

        //create unique file name using sampleFileDBname
        sampleFileDBname = sampleFile.name;
        try {
            //file exists
            let num = 1;
            let newName = sampleFileDBname;
            while(fs.existsSync( __dirname + '/upload/' + newName)) {
                newName = num + sampleFileDBname;
                num++;
            }
            sampleFileDBname = newName;
        } catch(err) {
            console.error(err)
        }

        uploadPath = __dirname + '/upload/' + sampleFileDBname;
        console.log(sampleFile);

        //Use mv() to place file on the server
        sampleFile.mv(uploadPath, function(err) {
            if(err) return res.status(500).send(err);

            });
    }
    

    pool.getConnection((err, connection)=> {
        if(err) throw err; //not connected
        console.log('Connected!');
            var dateObj = new Date();
            var month = dateObj.getUTCMonth() + 1; //months from 1-12
            var day = dateObj.getUTCDate();
            var year = dateObj.getUTCFullYear();

            const newdate = year + "/" + month + "/" + day;

        var sql = 'INSERT INTO posts VALUES (NULL,"' + (req.body.name||'') + '","' 
        + (sampleFileDBname||'') + '","'+ (req.body.title||'') + '","' + (req.body.pbody||'') + '","' + (newdate||'')
        +'")';
        connection.query(sql, (err, rows) => {
            //Once done, release connection
            connection.release();

                if(!err) {
                    res.redirect('/');
                } else {
                    console.log(err);
                }
        });
    
    
    
    
        
        
        
        
        //res.send('File uploaded!');



    }); 






});


app.listen(port, ()=> console.log(`Listening on port ${port}`));
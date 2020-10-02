'use strict';
const fs=require('fs');

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

const app = express();

// pentru cookies
app.use(cookieParser());

const port = 6789;
// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false,
	cookie: {
			expires: 10000
	}
}));

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res

app.get('/', (req, res) =>{
	
	//res.clearCookie("utilizator");
	res.render("index",{user:req.cookies.utilizator,nume:req.session.nume,prenume:req.session.prenume});
});


// la accesarea din browser adresei http://localhost:6789/chestionar se va apela funcția specificată
app.get('/chestionar', (req, res) => {
	
	fs.readFile('intrebari.json',(err,data)=>{
		if(err) throw err;
		let obj=JSON.parse(data);
		console.log(obj);
		res.render('chestionar', {intrebari: obj.listaIntrebari});
	});
});

app.post('/rezultat-chestionar', (req, res) => {
	
	fs.readFile('intrebari.json',(err,data)=>{
		if(err) 
			throw err;
		let obj=JSON.parse(data);
		console.log(obj);
		res.render('rezultat-chestionar', {raspunsuri:JSON.stringify(req.body),intrebari: obj.listaIntrebari});
	});
});

app.get('/autentificare', (req, res) => {
	res.clearCookie("mesajEroare");
	res.render('autentificare',{tipEroare:req.cookies.mesajEroare});
});

var membru=false;
app.post('/verificare-autentificare', (req, res) => {
	
	console.log(req.body);

	fs.readFile('utilizatori.json', (err, data) => {
    if (err) throw err;
    let student = JSON.parse(data);
		for(var i=0;i<student.length;i++)
		{
			if(req.body.login==student[i].utilizator && req.body.parola==student[i].parola)
			{

				console.log("Autentificare reusita");
				res.cookie("utilizator",req.body.login);
				req.session.nume=student[i].nume
				req.session.prenume=student[i].prenume;
				membru=true;
				break;
			}
		}
		if(membru==false)
		{
			console.log("Autentificare nereusita");
			res.cookie("mesajEroare","Autentificare nereusita");
			res.redirect("/autentificare");
		}else{

		res.redirect("/");
		}

});


});

app.get('/log-out', (req, res) => {
	
	req.session.destroy((err)=>{
		if(err){
			return console.log(err);
		}
		membru=false;
		res.redirect('/autentificare');
		console.log("Sesiune distrusa");
	});
});

app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:6789`));
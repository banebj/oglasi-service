const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs')
const url = require("url");

const app = require("../app")

const nodemailer = require("nodemailer");

let globalListaStanova = []

exports.getOglas = async function () {

    let listaStanova = [];
    
    request({ "rejectUnauthorized": false, 
    "url":'https://www.oglasi.rs/oglasi/nekretnine/izdavanje/stanova/grad/novi-sad/deo/grbavica?s=d&pr%5Bs%5D=50&pr%5Be%5D=220&pr%5Bc%5D=EUR&ss=1&rt=vlasnik&d%5BSobnost%5D%5B0%5D=Jednoiposoban&d%5BOpremljenost%5D%5B0%5D=Name%C5%A1ten'}
    , (err, res, body) => {
        if (err) { return console.log(err); }
        const $ = cheerio.load(body);

        let isNoviOglas = false;

        $('article').each((i, el) => {
            let oglas = {}

            const article = cheerio.load(el);
            //naslov

            oglas.naslov = article('h2')[0].children[0].data;

            //vlasnik
            oglas.vlasnik = article('cite')[0].children[0].data;

            //cena
            oglas.cena = article('.text-price strong')[0].children[0].data;

            //link
            oglas.link = article('.fpogl-list-title')[0].attribs.href

            oglas.lokacija = article('a')[6].children[0].data
            
            //stavljamo ID od oglasa iz linka
            let linkArray = oglas.link.split('/');
            oglas.id = linkArray[linkArray.length - 2]

            listaStanova.push(oglas)
        })
        // if (globalListaStanova.length == 0) {
        //     globalListaStanova = listaStanova.map(a => ({ ...a }));
        //     let transporter = nodemailer.createTransport({
        //         service: 'gmail',
        //         auth: {
        //             user: "banebjspam@gmail.com", // generated ethereal user
        //             pass: "banedb94" // generated ethereal password
        //         }
        //     });

        //     // setup email data with unicode symbols
        //     let mailOptions = {
        //         from: 'banebjspam@gmail.com', // sender address
        //         to: "banebj@gmail.com", // list of receivers
        //         subject: `Test mejl heroku app !!!`, // Subject line
        //         text: `test heroku`, // plain text body
        //     };

        //     // send mail with defined transport object
        //     transporter.sendMail(mailOptions, function (err, info) {
        //         if (err)
        //             console.log(err)
        //         else
        //             console.log(info);
        //     });
        // }
        if (globalListaStanova[0].id != listaStanova[0].id || globalListaStanova[1].id != listaStanova[1].id) {
            let noviOglas = listaStanova[0]
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "banebjspam@gmail.com", // generated ethereal user
                    pass: "banedb94" // generated ethereal password
                }
            });

            // setup email data with unicode symbols
            let mailOptions = {
                from: 'banebjspam@gmail.com', // sender address
                to: "duleucz@gmail.com", // list of receivers
                subject: `Novi oglas za stan ${noviOglas.naslov} !!!`, // Subject line
                text: `Novi oglas za stan ${noviOglas.naslov} na lokaciji ${noviOglas.lokacija} \n cena: ${noviOglas.cena}, vlasnik: ${noviOglas.vlasnik} \n \n
                LINK: https://www.oglasi.rs${noviOglas.link}`, // plain text body
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, function (err, info) {
                if (err)
                    console.log(err)
                else
                    console.log(info);
            });

            //TODO uzeti podatke s stranice

            // request(`https://www.oglasi.rs${link}`, (err, res, body) => {
            //     if (err) { return console.log(err); }
            //     const stranica = cheerio.load(body);

            //     oglas.lokacija = stranica('tr')[0].children[3].children[0].data;
            //     return oglas;
            // }, () => console.debug(oglas))

            globalListaStanova = listaStanova.map(a => ({ ...a }));
        }
    });
}

exports.refreshHeroku = async function () {

    request('https://ancient-harbor-48201.herokuapp.com/', (err, res, body) => {
        if (err) { return console.log(err); }
        console.debug("Idle success restart")
    });
}
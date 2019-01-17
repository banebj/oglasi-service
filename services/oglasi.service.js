const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs')

const app = require("../app")

const nodemailer = require("nodemailer");

let globalListaStanova = []

exports.getOglas = async function () {

    let listaStanova = [];
    request('https://www.oglasi.rs/oglasi/nekretnine/izdavanje/stanova/grad/novi-sad?s=d&pr%5Bs%5D=50&pr%5Be%5D=250&pr%5Bc%5D=EUR&rt=vlasnik&d%5BSobnost%5D%5B0%5D=Jednoiposoban&d%5BSobnost%5D%5B1%5D=Dvosoban&d%5BOpremljenost%5D%5B0%5D=Delimi%C4%8Dno+name%C5%A1ten&d%5BOpremljenost%5D%5B1%5D=Name%C5%A1ten', (err, res, body) => {
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
            let link = article('.fpogl-list-title')[0].attribs.href
            
            oglas.lokacija = article('a')[6].children[0].data
            // request(`https://www.oglasi.rs${link}`, (err, res, body) => {
            //     if (err) { return console.log(err); }
            //     const stranica = cheerio.load(body);

            //     oglas.lokacija = stranica('tr')[0].children[3].children[0].data;
            //     return oglas;
            // }, () => console.debug(oglas))

            oglas.link = `https://www.oglasi.rs${link}`



            listaStanova.push(oglas)
        })
        if (globalListaStanova.length == 0) {
            globalListaStanova = listaStanova.map(a => ({ ...a }));
        }
        else if (globalListaStanova[0].link != listaStanova[0].link || globalListaStanova[1].link != listaStanova[1].link){
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
                to: "banebj@gmail.com, ivanasender91@gmail.com, milos.djukic@devoteam.com", // list of receivers
                subject: `Novi oglas za stan ${noviOglas.naslov} !!!`, // Subject line
                text: `Novi oglas za stan ${noviOglas.naslov} na lokaciji ${noviOglas.lokacija} \n cena: ${noviOglas.cena}, vlasnik: ${noviOglas.vlasnik} \n \n
                LINK: ${noviOglas.link}`, // plain text body
            };

            // send mail with defined transport object
        transporter.sendMail(mailOptions, function (err, info) {
            if (err)
                console.log(err)
            else
                console.log(info);
        });

            globalListaStanova = listaStanova.map(a => ({ ...a }));
        }
    });
}
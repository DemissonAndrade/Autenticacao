require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

//Open routs
app.get('/', (req, res) => {
    res.status(200).json({ msg: "Meu projeto" })
})

const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose
    .connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.x9vg9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
        app.listen(5001)
        console.log('Conectou ao Banco!')
    })
    .catch((err) => console.log(err))

app.listen(5000);
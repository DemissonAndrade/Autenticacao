require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());

// Models
const User = require('./models/User');

//Open Route - Public Route
app.get('/', (req, res) => {
    res.status(200).json({ msg: "Meu projeto" })
});

//Private Route

app.get("/user/:id", checkToken, async (req, res) => {
    const id = req.params.id

    //check if user exists
    const user = await User.findById(id, '-password')

    if (!user) {
        return res.status(404).json({ msg: "Usuário não Cadastrado" })
    }

    res.status(200).json({ user })

})

function checkToken(req, res, next) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ msg: "Acesso negado!" })
    }

    try {

        const secret = process.env.SECRET

        jwt.verify(token, secret)

        next()

    } catch (error) {
        res.status(401).json({ msg: "Token iválido!" })
    }

}

//Register Users
app.post('/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;

    // validations
    if (!name) {
        return res.status(422).json({ msg: "O nome é obrigatório!" });
    }

    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório!" });
    }

    if (!password) {
        return res.status(422).json({ msg: "A senha e obrigatória" });
    }

    if (password !== confirmpassword) {
        return res.status(422).json({ msg: "As Senhas não Conferem!" });
    }

    //check if user exists
    const userExists = await User.findOne({ email: email })

    if (userExists) {
        return res.status(422).json({ msg: "Email já Cadastrado" });
    }

    // create password
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // create user
    const user = new User({
        name,
        email,
        password: passwordHash,
    })

    try {
        await user.save()
        res.status(201).json({ msg: "Usuário criado com Sucesso" })
    } catch (error) {

        console.log(error)

        res
            .status(500)
            .json({
                msg: "Error no servidor tente mas tarde!"
            })
    }

});

//login User
app.post('/auth/user', async (req, res) => {

    const { email, password } = req.body

    if (!email) {
        return res.status(422).json({ msg: "O email é obrigatório!" });
    }

    if (!password) {
        return res.status(422).json({ msg: "A senha e obrigatória" });
    }

    //check if User exists
    const user = await User.findOne({ email: email })

    if (!user) {
        return res.status(404).json({ msg: "Usuário não Cadastrado" })
    }

    //check if password match
    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
        return res.status(422).json({ msg: "Senha Inválida" })
    }

    try {

        const secret = process.env.SECRET
        const token = jwt.sign(
            {
                id: user._id,
            },

            secret,
        )

        res.status(200).json({ msg: 'Autenticação realizada com Sucesso', token })

    } catch (err) {
        console.log(error)

        res.status(500).json({
            msg: 'Erro na Autenticação'
        })
    }
})

// Credencials
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

mongoose
    .connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.x9vg9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
        app.listen(3000)
        console.log('Conectou ao Banco!')
    })
    .catch((err) => console.log(err));


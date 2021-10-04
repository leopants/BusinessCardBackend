const express = require("express");
const app = express();
var bodyParser = require("body-parser");
var cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize(
    "postgres://postgres:qwerty1234@35.222.122.234:5432/businessCards"
);
//const userModel = require("../BusinessCardBackend/models/users")

app.use(cors());
app.use(bodyParser.json());

const users = sequelize.define(
    "users",
    {
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userpassword: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: false,
    }
);

const card = sequelize.define(
    "card",
    {
        creatorid: {
            type: Sequelize.INTEGER,
            references: "users", // <<< Note, its table's name, not object name
            referencesKey: "id",
        },
        companyname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phonenumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fax: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        imagefront: {
            type: DataTypes.BLOB,
            allowNull: false,
        },
        imageback: {
            type: DataTypes.BLOB,
            allowNull: true,
        },
        qrcode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        timestamps: false,
    }
);

const holding = sequelize.define(
    "holding",
    {
        userid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        cardid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },

        dateheld: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        timestamps: false,
    }
);

try {
    sequelize.authenticate();
    console.log("Connection has been established successfully.");
} catch (error) {
    console.error("Unable to connect to the database:", error);
}

app.get("/", async (req, res) => {
    res.send("Hello World!");
});

app.post("/createuser", async (req, res) => {
    console.log("here");
    firstname = req.body.firstname;
    lastname = req.body.lastname;
    username = req.body.username;
    email = req.body.email;
    userpassword = req.body.userpassword;
    try {
        const newUser = await users.create({
            firstname: firstname,
            lastname: lastname,
            email: email,
            userpassword: userpassword,
            username: username,
        });
        console.log("User added to the table");
        res.status(200, "User added");
    } catch {
        //username or email already exists
        res.status(500, "no");
    }
});

app.post("/createcard", async (req, res) => {
    sequelize.authenticate();
    creatorid = req.body.creatorid;
    companyname = req.body.companyname;
    phonenumber = req.body.phonenumber;
    address = req.body.address;
    fax = req.body.fax;
    category = req.body.category;
    email = req.body.email;
    imagefront = req.body.imagefront;
    imageback = req.body.imageback;
    qrcode = req.body.qrcode;
    console.log("Variables saved");
    try {
        console.log("inside try");
        const currCard = await card.create({
            creatorid: creatorid,
            companyname: companyname,
            phonenumber: phonenumber,
            address: address,
            fax: fax,
            category: category,
            email: email,
            imagefront: imagefront,
            imageback: imageback,
            qrcode: qrcode,
        });
        console.log(currCard.id);
        currCard.qrcode =
            "https://business-card-backend-qkym9.ondigitalocean.app/getcardid?cardid=" +
            currCard.id;
        // the name is still "Jane" in the database
        await currCard.save();
        console.log("User added to the table");
        res.send("Card added");
    } catch {
        //username or email already exists
        res.send("no");
    }
});

app.get("/getcreatedcards", async (req, res) => {
    let userid = req.query.userid;

    let user = await card.findAll({ where: { creatorid: userid } });
    if (user) {
        //response = user.firstname, user.lastname, user.username, user.email, user.id]
        res.json(user);
    } else {
        res.status(400, "No user found");
    }
});

app.get("/getcards", async (req, res) => {
    let userid = req.query.userid;

    let user = await holding.findAll({ where: { userid: userid } });
    if (user) {
        //response = user.firstname, user.lastname, user.username, user.email, user.id]
        res.json(user);
    } else {
        res.status(400, "No user found");
    }
});

app.get("/getcardid", async (req, res) => {
    let cardid = req.query.cardid;

    let curCard = await card.findAll({ where: { cardid: cardid } });
    if (currCard) {
        //response = user.firstname, user.lastname, user.username, user.email, user.id]
        res.send(currCard.cardid);
    } else {
        res.status(400, "No card found");
    }
});

app.get("/getuser", async (req, res) => {
    let username = req.query.username;
    let userpassword = req.query.userpassword;

    let user = await users.findOne({ where: { username: username } });
    if (user) {
        //response = user.firstname, user.lastname, user.username, user.email, user.id]
        res.json(user);
    } else {
        res.status(400, "No user");
    }
});

app.get("/loginuser", async (req, res) => {
    let username = req.query.username;
    let userpassword = req.query.userpassword;

    let user = await users.findOne({ where: { username: username } });
    if (user) {
        //response = user.firstname, user.lastname, user.username, user.email, user.id]
        if (user.userpassword == userpassword) {
            res.status(200, "User found");
        } else {
            res.status(400, "Incorrect password");
        }
    } else {
        res.status(400, "No user with that username");
    }
});

app.post("/addtowallet", async (req, res) => {
    let userid = req.query.userid;
    let cardid = req.query.cardid;
    let dateheld = new Date().getTime();

    let card = await card.findOne({ where: { cardid: cardid } });
    if (card) {
        try {
            const newCard = await holding.create({
                userid: userid,
                cardid: cardid,
                dateheld: dateheld,
            });
            res.status(200, "Card added");
        } catch {
            res.status(400, "database error");
        }
    }
});

app.delete("/deletecardfromwallet", async (req, res) => {
    let cardid = req.query.cardid;
    let userid = req.query.cardid;

    await holding.destroy({
        where: {
            userid: userid,
            cardid: cardid,
        },
    });
});

app.listen(process.env.PORT || 8080);

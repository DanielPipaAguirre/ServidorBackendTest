const express = require("express");
const exphbs = require("express-handlebars");
const passport = require("passport");
const nodemailer = require("nodemailer");
const FacebookStrategy = require("passport-facebook").Strategy;
const routes = require("./routes/routes");
const dotenv = require("dotenv");
const chat = require("./controllers/chat");
const normalizr = require("normalizr");
const config = require("./config/config.json");
const controllersdb = require("./controllers/users");

const app = express();
const http = require("http");
const server = http.createServer(app);

dotenv.config();

const normalize = normalizr.normalize;
const schema = normalizr.schema;

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    auth: {
        user: "myron.strosin30@ethereal.email",
        pass: "QWXeMDBUT4etwyY92h",
    },
});

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;

passport.use(
    new FacebookStrategy(
        {
            clientID: FACEBOOK_CLIENT_ID,
            clientSecret: FACEBOOK_CLIENT_SECRET,
            callbackURL: "/auth/facebook/callback",
            profileFields: ["id", "displayName", "photos", "emails"],
            scope: ["email"],
        },
        function (accessToken, refreshToken, profile, done) {
            let userProfile = profile;
            const date = new Date().toLocaleString();
            const mailOptions = {
                from: "Servidor Node.js",
                to: "myron.strosin30@ethereal.email",
                subject: `LOGIN ${userProfile.displayName} ${date}`,
                html: '<h1 style="color: blue;"></h1>',
                attachments: [
                    {
                        path: userProfile.photos[0].value,
                    },
                ],
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log(err);
                    return err;
                }
                console.log(info);
            });

            return done(null, userProfile);
        }
    )
);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

app.engine(".hbs", exphbs({ extname: ".hbs", defaultLayout: "main.hbs" }));
app.set("view engine", ".hbs");
app.use(express.static(__dirname + "/views"));

app.use(require("cookie-parser")());
app.use(express.urlencoded({ extended: true }));

app.use(
    require("express-session")({
        secret: "keyboard cat",
        cookie: {
            httpOnly: false,
            secure: false,
            maxAge: 10 * 60,
        },
        rolling: true,
        resave: true,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", routes.getRoot);

//  LOGIN
app.get("/login", routes.getLogin);

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
        successRedirect: "/login",
        failureRedirect: "/faillogin",
    })
);

app.get("/faillogin", routes.getFaillogin);

//  SIGNUP
app.get("/signup", routes.getSignup);

app.post(
    "/signup",
    passport.authenticate("signup", { failureRedirect: "/failsignup" }),
    routes.postSignup
);
app.get("/failsignup", routes.getFailsignup);

function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
    }
}

app.get("/ruta-protegida", checkAuthentication, (req, res) => {
    res.send("<h1>Ruta OK!</h1>");
});

//  LOGOUT
app.get("/logout", routes.getLogout);

//  FAIL ROUTE
app.get("*", routes.failRoute);

// CENTRO DE MENSAJES
const { Server } = require("socket.io");
const io = new Server(server);

const accountSid = "ACd4a8f3cc59824a15865710f433d6027d";
const authToken = "13643466a0161e0c46e7400cdb699ade";

const client = require("twilio")(accountSid, authToken);

io.on("connection", async (socket) => {
    const messages = await chat.findAll();

    // json normalize
    const mensajesConId = {
        id: "mensajes",
        mensajes: messages.map((mensaje) => ({ ...mensaje._doc })),
    };
    const schemaAuthor = new schema.Entity("author", {}, { idAttribute: "id" });

    const schemaMensaje = new schema.Entity(
        "post",
        { author: schemaAuthor },
        { idAttribute: "_id" }
    );
    const schemaMensajes = new schema.Entity(
        "posts",
        { mensajes: [schemaMensaje] },
        { idAttribute: "id" }
    );

    const normalizedData = normalize(mensajesConId, schemaMensajes);

    io.sockets.emit("mensajes", normalizedData);

    socket.on("nuevo-mensaje", async function (data) {
        await chat.create(data);
        if (data.text.toUpperCase() === "ADMINISTRADOR") {
            client.messages
                .create({
                    body: `${data.author.nombre} ${data.author.apellido}: ${data.text}`,
                    from: "(914) 768-4697",
                    to: "+51902676112",
                })
                .then((message) => console.log(message.sid))
                .catch(console.log);
        }
        const messages = await chat.findAll();

        // json normalize
        const mensajesConId = {
            id: "mensajes",
            mensajes: messages.map((mensaje) => ({ ...mensaje._doc })),
        };
        const schemaAuthor = new schema.Entity(
            "author",
            {},
            { idAttribute: "id" }
        );

        const schemaMensaje = new schema.Entity(
            "post",
            { author: schemaAuthor },
            { idAttribute: "_id" }
        );
        const schemaMensajes = new schema.Entity(
            "posts",
            { mensajes: [schemaMensaje] },
            { idAttribute: "id" }
        );

        const normalizedData = normalize(mensajesConId, schemaMensajes);

        io.sockets.emit("mensajes", normalizedData);
    });
});

controllersdb.conectarDB(config.MONGO_URL, (err) => {
    if (err) return console.log("error en conexión de base de datos", err);
    console.log("BASE DE DATOS CONECTADA");

    server.listen(3000, function () {
        console.log("Aplicación ejemplo, escuchando el puerto 3000!");
    });
});

const nodemailer = require("nodemailer");

let user;

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    auth: {
        user: "myron.strosin30@ethereal.email",
        pass: "QWXeMDBUT4etwyY92h",
    },
});

function getRoot(req, res) {
    res.send("Bienvenido al ejemplo de passport con facebook");
}

function getLogin(req, res) {
    if (req.isAuthenticated()) {
        user = req.user;
        res.render("login-ok", {
            usuario: user.displayName,
            photo: user.photos[0].value,
            email: user.emails[0].value,
        });
    } else {
        res.sendFile(__dirname + "/views/login.html");
    }
}

function getSignup(req, res) {
    res.sendFile(__dirname + "/views/signup.html");
}

function postLogin(req, res) {
    res.sendFile(__dirname + "/views/index.html");
}

function postSignup(req, res) {
    res.sendFile(__dirname + "/views/index.html");
}

function getFaillogin(req, res) {
    console.log("error en login");
    res.render("login-error", {});
}

function getFailsignup(req, res) {
    console.log("error en signup");
    res.render("signup-error", {});
}

function getLogout(req, res) {
    const mailOptions = {
        from: "Servidor Node.js",
        to: "myron.strosin30@ethereal.email",
        subject: `LOGOUT ${user.displayName} ${new Date().toLocaleString()}`,
        html: '<h1 style="color: blue;">Usted a cerrado sesión</span></h1>',
        attachments: [
            {
                path: user.photos[0].value,
            },
        ],
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            return err;
        }
        console.log(info);
        req.logout();
        res.sendFile(__dirname + "/views/index.html");
    });
}

function failRoute(req, res) {
    res.status(404).render("routing-error", {});
}

module.exports = {
    getRoot,
    getLogin,
    postLogin,
    getFaillogin,
    getLogout,
    failRoute,
    getSignup,
    postSignup,
    getFailsignup,
};

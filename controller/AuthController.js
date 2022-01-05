const speakeasy = require('speakeasy');
const bcrypt = require('bcrypt');
const QRCode = require('qrcode')
const User = require('../models/User');
const saltRounds = 10;

exports.authtest = (req, res, next) => {
    res.send({msg: 'API ROUTE OKE!'})
};

exports.authRoute = async (req, res, next) => {
    if(req.session.authenticated) {
        next()
    } else {
        req.flash('error', 'You are not allowed to do that');
        res.redirect('/login')
    }
}

exports.logout = async (req, res, next) => {
    console.log('logout');
    res.cookie(process.env.KEY, '', {expires: new Date(0)})
    req.session.authenticated = false;
    res.status(200).json({msg: true})
}

exports.login = async (req, res, next) => {

    const {email, password} = req.body;
    try {
        console.log(email);
        const user = await User.findOne({email: email.toLowerCase()});

        if(!user) return res.json({msg: 'Invalid credentials'});

        //Compare the hashed password
        const validPassword = await bcrypt.compare(password, user.password);

        if(validPassword) {
            res.status(200).json({validPassword: true})
        } else {
            req.flash('error', 'Invalid Credentials')
            res.redirect('/login');
        }
    } catch (error) {
        console.error(error)
        req.flash('error', 'Invalid Credentials')
        res.redirect('/login');
    }

}

exports.register = async (req, res, next) => {
    
    const {name, email, password, password2} = req.body;
    if(password !== password2) res.status(500).json({msg: 'Credentials invalid: no matching passwords'});

    try {
        // Check if user already exists
        const userExists = await User.findOne({email});
        //TODO: Add render to register form with REQ.FLASHES IN THE SESSION
        if(userExists) return res.status(500).json({msg: 'Credentials invalid: User already exists'});

        // Hash password
        const encryptPassword = await bcrypt.hash(password, saltRounds);

        const temp_secret = speakeasy.generateSecret({name: 'PriceCast Fuel'});
        const newUser = {
            name,
            email: email.toLowerCase(),
            temp_secret,
            password: encryptPassword
        };
        const user = await User.create(newUser);

        // Generate QR code URL
        const qrcode = await QRCode.toDataURL(temp_secret.otpauth_url);
        req.flash('success', `You are now registred with ${user.email}! Please verify 2fa 👋`);
        res.render('authenticate', {qrcode, email: user.email});
    } catch (error) {
        console.log(error);
        req.flash('error', 'Something went wrong: Registration is not completed');
        res.redirect('/register')
    }
};

exports.verifySecret = async (req, res) => {
    const {email, token, id} = req.body;

    console.log(email);

    try {
        const user = await User.findOne({email}, '-password')

        const {base32:secret} = user.temp_secret;

        console.log(secret);
        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token
        });

        if(verified) {
            const savedUser = await User.findOneAndUpdate({email}, {secret: user.temp_secret, temp_secret: null}, {new: true});
            req.session.authenticated = true
            req.flash('success', 'You 2 factor authentication is successfully enabled');
            res.redirect('/register');
        } else {
            req.flash('error', 'Something went wrong: Two Factor Authentication is not enabled');
            res.redirect('/register')
        }

    } catch (error) {
        console.log(error);
        req.flash('error', 'Something went wrong: Two Factor Authentication is not enabled');
        res.redirect('/register')
    }
}

exports.validateSecret = async (req, res) => {
    const {email, token} = req.body;

    try {
        const user = await User.findOne({email: email.toLowerCase()}, '-password')

        const {base32:secret} = user.secret;

        console.log(secret);
        const tokenValidates = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token,
            window: 1
        });

        if(tokenValidates) {
            req.session.authenticated = true;
            req.flash('success', 'Logged in successfully')
            res.redirect('/')
        } else {
            req.flash('error', 'Something went wrong: Your token is invalid')
            res.redirect('/login');
        }

    } catch (error) {
        console.log(error);
        req.flash('error', 'Something went wrong......')
        res.redirect('/login');
    }
}
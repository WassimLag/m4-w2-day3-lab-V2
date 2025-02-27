const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
const auth = require('http-auth');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const Registration = mongoose.model('Registration');
const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

router.get('/', (req, res) => {
  res.render('form', { title: 'Registration form' });
});

router.get('/registrations', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('index', { title: 'Listing registrations', registrations });
    })
    .catch(() => { 
      res.send('Sorry! Something went wrong.'); 
    });
}));

router.post('/', 
    [
        check('name').isLength({ min: 1 }).withMessage('Please enter a name'),
        check('email').isLength({ min: 1 }).withMessage('Please enter an email'),
        check('username').isLength({ min: 1 }).withMessage('Please enter a username'),
        check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            try {
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                const registration = new Registration({
                    name: req.body.name,
                    email: req.body.email,
                    username: req.body.username,
                    password: hashedPassword
                });
                
                await registration.save();
                res.send('Thank you for your registration!');
            } catch (err) {
                console.log(err);
                res.send('Sorry! Something went wrong.');
            }
        } else {
            res.render('form', { 
                title: 'Registration form',
                errors: errors.array(),
                data: req.body,
             });
        }
    }
);

module.exports = router;

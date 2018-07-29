const express = require('express');
const request = require('request');
const apiURL = require('../config.json').apiUrl;

const router = express.Router();

const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

router.use(csrfProtection);

const getOptions = {
	method: 'GET',
	headers: {
		'cache-control': 'no-cache',
		'user-agent': 'node.js',
		'Content-Type': 'application/json'
	}
}

/* GET home page. */
router.get('/', (req, res) => {
  res.render('registration', { title: 'Learn Node basics', csrfToken: req.csrfToken(), isRegistrationPage: true });
});

router.post('/account/signup', (req, res) => {
	const user = req.body || [];
  	let username, email, password;
	if (Object.keys(user).length) {
		username = user.username;
		email = user.email;
		password = user.password && user.password[0] === user.password[1] ? user.password[0] : '';
	}
	if (!username || !email || !password) {
		res.render('registration', { 
					title: 'Learn Node basics',
					isRegistrationPage: true,
					status: false
				});
		return;
	}

	req.session.user = {
		username,
		email,
		password
	};
	res.redirect('/git');
});

router.get('/logout', (req, res) => {
	delete req.session.user;
	res.redirect('/');
	
})

router.get('/git', (req, res) => {
	console.log(req.session.user);
	if (req.session.user) {
		res.render('index', { title: 'GitHub Api Integration' });
	} else {
		res.redirect('/');
	}
});

router.post('/git/getUesrs', (req, res) => {
	const query = req.body && req.body.search;

	const options = getOptions;
	options.url = `${apiURL}/search/users?q=${query}+in:fullname`;

	request(options, (error, response, body) => {
		if (error) throw new Error(error);

		res.json(body);
	});

});

router.post('/git/getUserRepoDetails', (req, res) => {
	const repo_url = req.body && req.body.repo_url;

	const options = getOptions;
	options.url = repo_url;

	request(options, (error, response, body,) => {
		if (error) throw new Error(error);

		res.json(body);
	})
});

router.post('/git/getUserDetails', (req, res) => {
	const info_url = req.body && req.body.info_url;

	const options = getOptions;
	options.url = info_url;

	request(options, (error, response, body) => {
		if (error) throw new Error(error);

		res.json(body);
	});
})

module.exports = router;

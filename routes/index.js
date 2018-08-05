const express = require('express');
const request = require('request');
const apiURL = require('../config.json').apiUrl;
const async = require("async");

const router = express.Router();

const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

router.use(csrfProtection);

router.use(function(req, res, next) {
	res.locals.csrfToken = req.csrfToken();
	next();
});

const getOptions = {
	method: 'GET',
	headers: {
		'cache-control': 'no-cache',
		'user-agent': 'node.js',
		'Content-Type': 'application/json'
	}
}

/* async Operation*/

/* async-parallel */

router.get('/async-parallel/array', (req, res) => {
	async.parallel([
		(callback) => {
			setTimeout(() => {
				callback(null, 'one');
			},2000);
		},
		(callback) => {
			setTimeout(() => {
				callback(null, 'two');
			},1000);	
		}
	], (error, results) => {
		csonsole.log(results);
	})
});

router.get('/async/parallel/:uId?', (req, res) => {
	const userId = req.params && req.params.uId;
	const options = getOptions;
	async.parallel([
			(callback) => {
				options.url = `${apiURL}/users/${userId}/repos`;
				request(options, (error, response, body) => {
					if (error) throw new Error(error);

					callback(null, JSON.parse(body));
				});
			},
			(callback) => {
				options.url = `${apiURL}/users/${userId}`;
				request(options, (error, response, body) => {
					if (error) throw new Error(error);

					callback(null, JSON.parse(body));
				})
			}
		],(error, results) => {
			if (error) throw new Error(error);

			res.json(results);
	});
});

/* async-series */

router.get('/async/series/:uId?', (req, res) => {
	const userId = req.params && req.params.uId;
	const options = getOptions;
	const locals = {};

	async.series([
			(callback) => {
				options.url = `${apiURL}/users/${userId}/repos`;
				request(options, (error, response, body) => {
					if (error) throw new Error(error);
					
					locals.repos = JSON.parse(body);
					callback(null, locals.repos);
				});
			},
			(callback) => {
				options.url = `${apiURL}/users/${userId}`;
				request(options, (error, response, body) => {
					if (error) throw new Error(error);

					locals.user = JSON.parse(body);
					callback(null, locals.user);
				})
			}
		], (error, results) => {
			if (error) throw new Error(error);

			res.json(results);
	});
});

/* async-waterfall */

router.get('/async/waterfall/:uId?', (req, res) => {
	const userId = req.params && req.params.uId;
	const options = getOptions;

	async.waterfall([
			(callback) => {
				options.url = `${apiURL}/users/${userId}/repos`;
				request(options, (error, response, repos) => {
					if (error) throw new Error(error);
					
					callback(null, JSON.parse(repos));
				});
			},
			(repos, callback) => {
				options.url = `${apiURL}/users/${userId}`;
				request(options, (error, response, user) => {
					if (error) throw new Error(error);

					callback(null, {
						user:  JSON.parse(user),
						repos
					});
				});
			},
			(results, callback) => {
				options.url = `https://jsonplaceholder.typicode.com/todos/1`;
				request(options, (error, response, demo) => {
					if (error) throw new Error(error);

					callback(null, {
						user:  results.user,
						repos: results.repos,
						demo: JSON.parse(demo)
					});
				})
			}
		], (error, results) => {
			if (error) throw new Error(error);

			res.json(results);
	});
});

/* GET home page. */
router.get('/', (req, res) => {
  res.render('registration', { title: 'Learn Node basics', isRegistrationPage: true });
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

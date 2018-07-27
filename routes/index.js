const express = require('express');
const request = require('request');
const apiURL = require('../config.json').apiUrl;

const router = express.Router();

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
  res.render('index', { title: 'GitHub Api Integration' });
});

router.post('/getUesrs', (req, res) => {
	const query = req.body && req.body.search;

	const options = getOptions;
	// options.url = `${apiURL}/users`;
	options.url = `${apiURL}/search/users?q=${query}+in:fullname`;

	/*{
		method: 'GET',
		url: `${apiURL}/users`,
		headers: {
			'cache-control': 'no-cache',
			'user-agent': 'node.js'
		}
	};*/

	request(options, (error, response, body) => {
		if (error) throw new Error(error);

		res.json(body);
	});

});

router.post('/getUserRepoDetails', (req, res) => {
	const repo_url = req.body && req.body.repo_url;

	const options = getOptions;
	options.url = repo_url;

	request(options, (error, response, body,) => {
		if (error) throw new Error(error);

		res.json(body);
	})
});

router.post('/getUserDetails', (req, res) => {
	const info_url = req.body && req.body.info_url;

	const options = getOptions;
	options.url = info_url;

	request(options, (error, response, body) => {
		if (error) throw new Error(error);

		res.json(body);
	});
})

module.exports = router;

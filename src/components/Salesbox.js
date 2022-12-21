import React, { useEffect } from 'react';
import { isWindows } from 'react-device-detect';
import { useParams } from 'react-router-dom';

// import { Container } from './styles';

function SalesBox() {
	const params = useParams();

	console.log(params, 'params');

	useEffect(() => {
		console.log(decodeURI(params.url), 'url');
		localStorage.setItem('token', params.token);
		localStorage.setItem('url', decodeURIComponent(params.url));
		window.location.replace('/');
	}, [params]);

	return <></>;
}

export default SalesBox;

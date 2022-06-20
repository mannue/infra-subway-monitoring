import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

let req_duration = 1;
let VU = 30 * (2 * req_duration) / 2;

export let options = {
    stages: [
        { duration: '5m', target: VU },
        { duration: '25m', target: VU },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
        'logged in successfully': ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
};

const BASE_URL = 'https://mannue.kro.kr';
const USERNAME = 'sppe12@naver.com';
const PASSWORD = '1234';

export default function ()  {

    var payload = JSON.stringify({
        email: USERNAME,
        password: PASSWORD,
    });

    var params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };


    let loginRes = http.post(`${BASE_URL}/login/token`, payload, params);

    check(loginRes, {
        'logged in successfully': (resp) => resp.json('accessToken') !== '',
    });


    let authHeaders = {
        headers: {
            Authorization: `Bearer ${loginRes.json('accessToken')}`,
        },
    };
    let response = http.get(`${BASE_URL}/path?source=1&target=7`, authHeaders);
    check(response, {
        'is status 200': (r) => r.status === 200,
        'result data' : (r) => r.json('stations') !== ''
    });
    sleep(1);
};

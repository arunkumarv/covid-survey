#!/bin/sh
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/dashboard.html  -O /usr/Apps/cov/views/mvd/chennai_dashboard/dashboard.html
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/report.html -O /usr/Apps/cov/views/mvd/chennai_dashboard/report.html
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/static/dashboard.js  -O /usr/Apps/cov/public/scripts/libraries/chennai_dashboard/js/dashboard.js
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/static/report.js   -O /usr/Apps/cov/public/scripts/libraries/chennai_dashboard/js/report.js

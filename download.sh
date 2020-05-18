#!/bin/sh
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/dashboard.html  -P /usr/Apps/cov/views/mvd/chennai_dashboard -O dashboard.html
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/report.html -P /usr/Apps/cov/views/mvd/chennai_dashboard  -O report.html
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/static/dashboard.js  -P /usr/Apps/cov/public/scripts/libraries/chennai_dashboard/js -O dashboard.js
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/static/report.js   -P /usr/Apps/cov/public/scripts/libraries/chennai_dashboard/js -O report.js
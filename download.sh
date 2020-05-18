#!/bin/sh
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/dashboard.html -O dashboard.html -P /usr/Apps/cov/views/mvd/chennai_dashboard
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/report.html -O report.html -P /usr/Apps/cov/views/mvd/chennai_dashboard
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/static/dashboard.js -O dashboard.js -P /usr/Apps/cov/public/scripts/libraries/chennai_dashboard/js
wget https://raw.githubusercontent.com/arunkumarv/covid-survey/tvm/static/report.js  -O report.js -P /usr/Apps/cov/public/scripts/libraries/chennai_dashboard/js
node_modules/@financial-times/n-gage/index.mk:
	npm install @financial-times/n-gage
	touch $@

-include node_modules/@financial-times/n-gage/index.mk

TEST_HOST := "ft-next-lure-api-branch-${CIRCLE_BUILD_NUM}"

coverage-report:
	export NODE_ENV=test; export AWS_SIGNED_FETCH_DISABLE_DNS_RESOLUTION=true; istanbul cover node_modules/.bin/_mocha --report=$(if $(CIRCLECI),lcovonly,lcov) 'test/**/*.test.js'

unit-test:
	export NODE_ENV=test; export AWS_SIGNED_FETCH_DISABLE_DNS_RESOLUTION=true; mocha 'test/**/*.test.js'

smoke-test-local:
	nht smoke local.ft.com:5050

test:
	make verify

# ifeq ($(CIRCLE_BRANCH),master)
# 	make coverage-report && cat ./coverage/lcov.info | ./node_modules/.bin/coveralls
# else
# 	make unit-test
# endif

run:
	nht run --local --inspect

deploy:
	nht ship -m --vault

provision:
	nht float -md --testapp ${TEST_HOST} --vault

tidy:
	# nht destroy ${TEST_HOST}

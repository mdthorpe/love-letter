clean:
	rm -f .DS_store
	rm -rf node_modules

nvm:
	export NVM_DIR=~/.nvm
	. /usr/local/opt/nvm/nvm.sh; \
	nvm use stable

run: nvm ## Run the app locally
	node ./app.js

dev: clean
	export NVM_DIR=~/.nvm
	. /usr/local/opt/nvm/nvm.sh; \
	nvm use stable
	npm install --save-dev

install: clean nvm
	npm install --save-dev

clean:
	rm -f .DS_store

nvm:
	export NVM_DIR=~/.nvm
	. /usr/local/opt/nvm/nvm.sh; \
	nvm use stable

run: nvm ## Run the app locally
	node ./app.js

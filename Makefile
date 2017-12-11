NAME = personaldashboard
VERSION = $(shell expr `az acr repository show-tags -n ${NAME} --repository ${NAME} -o table | grep -Eo "[0-9]+" --only-matching | sort -g | tail -1` + 1)
LOGIN_SERVER = $(shell az acr show --name ${NAME} --query loginServer -o table | tail -1)
REGISTRY_PASSWORD = $(shell az acr credential show --name ${NAME} --query "passwords[0].value")
STORAGE_KEY = $(shell az storage account keys list --account-name personaldashboard --resource-group personaldashboard -o table | tail -1 | cut -c27-)

build:
	docker build -t ${NAME} ./
	docker tag ${NAME} ${LOGIN_SERVER}/${NAME}:v${VERSION}

deploy: fetchconfig login
	docker push ${LOGIN_SERVER}/${NAME}:v${VERSION}
	az container create --name ${NAME} -e TZ="America/New_York" --image ${LOGIN_SERVER}/${NAME}:v${VERSION} --cpu 1 --memory 0.5 --registry-password ${REGISTRY_PASSWORD} --ip-address public --ports 8080 -g ${NAME}
	az container show --name ${NAME} --resource-group ${NAME} --query instanceView.state

showvars: login
	@echo ${NAME}
	@echo ${VERSION}
	@echo ${LOGIN_SERVER}
	@echo ${REGISTRY_PASSWORD}
	@echo ${STORAGE_KEY}

login:
	az acr login --name ${NAME}

commitconfig:
	az storage blob upload --container-name ${NAME} --file server/config.json --name config.json --account-name ${NAME} --account-key ${STORAGE_KEY} -o table

fetchconfig:
	az storage blob download --container-name ${NAME} --name config.json --file server/config.json --account-name ${NAME} --account-key ${STORAGE_KEY} -o table

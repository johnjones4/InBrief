NAME = inbrief
SSH_NAME = ${NAME}
REMOTE_NAME = johnjones4/${NAME}

build:
	docker build -t ${NAME} ./
	docker tag ${NAME} ${REMOTE_NAME}
	docker push ${REMOTE_NAME}

deploy: build start

start:
	ssh ${SSH_NAME} "docker stop ${NAME} && docker rm ${NAME} && docker pull ${REMOTE_NAME} && docker run -d -v /home/ubuntu/config:/config -e CONFIG=/config/config.json -e PORT=80 -e UV_THREADPOOL_SIZE=128 -p 80:80  --restart always --name ${NAME} ${REMOTE_NAME}"

restart:
	ssh ${SSH_NAME} "docker stop ${NAME} && docker start -p 80:80 ${NAME}"

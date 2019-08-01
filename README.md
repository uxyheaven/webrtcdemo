# vue-demo

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your tests

```
npm run test
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

### docker

```
docker run -d --name nginx-a \
-p 443:443 \
-p 8080:8080 \
-v `pwd`/dist:/etc/nginx/html:ro \
-v `pwd`/nginx/nginx.conf:/etc/nginx/nginx.conf:rw \
-v `pwd`/nginx/certs:/etc/nginx/certs:ro \
nginx
```

# apiance

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

### Must have when working

https://www.youtube.com/watch?v=IQkDtt1CRiQ
https://cli.vuejs.org/guide/creating-a-project.html#vue-create

http://localhost:8080/app/home

https://material.io/components/pickers/
https://vuematerial.io/getting-started/

https://github.com/vuetifyjs/vuetify
https://fontawesome.com/icons?d=gallery&q=user

## Docker build steps

docker build . -t apiance-client
docker run -d -p 8080:80 apiance-client

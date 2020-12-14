# drawtogether

## Working Demo (Beta)
https://dev.amonwondra.de

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### MongoDB

mongo -u admin -p --authenticationDatabase admin <- Opening Shell with user "admin"
use admin <- Grant your shell instance admin rights

### Apache Node Service
Enable the Service
    systemctl enable nodeserver.service
    
Start the service
    systemctl start nodeserver.service

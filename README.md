# drawtogether

# Live Demo (Beta)
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

### Running a local demo
```
yarn install
yarn serve
```
#### Running local sharedb
```
Run following file:
ShareDBServer/main.js
```

### MongoDB

mongo -u admin -p --authenticationDatabase admin <- Opening Shell with user "admin"
use admin <- Grant your shell instance admin rights

### Apache Node Service
Enable the Service
    systemctl enable nodeserver.service
    
Start the service
    systemctl start nodeserver.service

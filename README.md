# Tyba Test Backend natobo

- npm start to run server. (watchout for the postgres env)
- npm run dev to run in development mode

# Endpoints:

- POST {{url}}/users/signup

```bash
   {
    "name":"Name",
    "email":"sample@sample.com",
    "password":"example123",
    "passwordConfirm": "example123"
  }
```

- POST {{url}}/users/login

```bash
  {
  "email":"sample@sample.com",
  "password":"example123"
  }
```

- GET {{url}}/users/logout
- POST {{url}}/location/getRestaurants

```bash
  {
    "lat":45,
    "lng":-110
 }
```

### With Admin access and Login

- GET ALL domain/users/ (needs authorization header and admin auth first)
- DELETE domain/users/ (needs authorization header and admin auth first)

## ¿Qué falto?

- Historial 😅
- Pruebas unitarias con jest 🙈

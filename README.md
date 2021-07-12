# Tyba Test Backend natobo

- npm start to run server. (watchout for the postgres env)
- npm run dev to run in development mode
- See folder utils/postmanCollection to more details

# Endpoints:

- POST domain/users/signup

```bash
   {
    "name":"Name",
    "email":"sample@sample.com",
    "password":"example123",
    "passwordConfirm": "example123"
  }
```

- LOGIN {{url}}/users/login

```bash
  {
  "email":"sample@sample.com",
  "password":"example123"
  }
```

### With Admin access and Login

- GET ALL domain/users/ (needs authorization header and admin auth first)
- DELETE domain/users/ (needs authorization header and admin auth first)

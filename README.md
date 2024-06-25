<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">


## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# watch mode
$ npm run start:dev
```

## Docker container

ACLARACION: utiliza la imagen Postgres:15.1 en el puerto 5432. Dejo el dockerfile en el repositorio

```bash
# levantar contenedor
$ docker-compose up

# matar contenedor
$ docker-compose down
```

## Migrations

ACLARACION: Tener en cuenta que el path configurado es a partir del directorio src, asique los imports de los archivos tienen que ser relativos. Es decir, en vez de hacer esto "src/" hay que hacer "../"

```bash
# generar migracion
$ npm run m:gen:dev -- src/migrations/init

# correr migracion
$ npm run m:gen:dev
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Lucas Busso](https://linkedin.com/in/lucas-busso/)

## License

Nest is [MIT licensed](LICENSE).
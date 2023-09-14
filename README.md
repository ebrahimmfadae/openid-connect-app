# OpenID Connect App

<p>
    <a href="https://github.com/ebrahimmfadae/openid-connect-app/blob/main/LICENSE" target="_blank">
        <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Released under the MIT license." />
    </a>
    <a>
        <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
    </a>
    <a href="https://github.com/ebrahimmfadae/openid-connect-app/last-commit" target="_blank">
        <img src="https://img.shields.io/github/last-commit/ebrahimmfadae/openid-connect-app? style=flat-square" alt="Last commit">
    </a>
    <a href="https://github.com/ebrahimmfadae/openid-connect-app/issues" target="_blank">
        <img src="https://img.shields.io/github/issues/ebrahimmfadae/openid-connect-app? style=flat-square"/>
    </a>
</p>

<p>
  Sample project for implementing <b>OIDC</b> server with a web application and an API service.
</p>

## Article reference

This repository is associated with an article series that provides a step-by-step guide on implementing OIDC ([OpenID Connect 1.0](https://openid.net/specs/openid-connect-core-1_0.html)) with Node.js, TypeScript, and MongoDB:

-   [Series: Implementing OpenID with Node.js, TypeScript, and MongoDB - A Step-by-Step Guide](https://dev.to/ebrahimmfadae/setup-openid-with-nodejs-and-mongodb-451j)
-   [Part I: Developing Simple OpenID Authorization Server with Node.js & Typescript](https://dev.to/ebrahimmfadae/develop-an-openid-server-with-nodejs-typescript-9n1)
-   [Part II: Persisting OpenID Server Data on MongoDB with Node.js](https://dev.to/ebrahimmfadae/persist-openid-server-data-with-mongodb-5f95)
-   [Part III: Adding Resource Server Authorization to OpenID with Node.js](https://dev.to/ebrahimmfadae/add-a-resource-server-to-an-openid-provider-noo)
-   [Part IV: Configuring OpenID Security Settings in Node.js](https://dev.to/ebrahimmfadae/openid-security-configuration-4nn8)

## Project requirements

The project has been developed and tested in the following environment:

```
$ node -v
v18.17.1

$ yarn -v
v3.6.3

$ docker --version
Docker version 20.10.7, build f0df350

$ docker compose version
Docker Compose version v2.15.1
```

## Getting started

**Install dependencies** Open a terminal and run the following command to install the project dependencies:

```
$ yarn install
```

**Run containers** Start the project containers by running the command:

```
$ yarn compose:up
```

You can see the front end by navigating to [http://localhost:3005](http://localhost:3005) with your browser.

**Stop containers** When you're done using the application, stop the containers by running the command:

```
$ yarn compose:down
```

## How to contribute

If you have any suggestions or want to propose code changes, you can open an issue or create a pull request with your proposed changes. Feel free to make any further adjustments or additions to the README to suit your project's specific requirements and conventions.

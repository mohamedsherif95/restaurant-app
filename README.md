# Project Setup and Running Guide

## Overview

This project is a NestJS application that uses MongoDB and Redis. The application, MongoDB, and Redis are all containerized using Docker. This guide will help you set up and run the project using Docker and Docker Compose.

## Prerequisites

- Docker: [Install Docker](https://docs.docker.com/get-docker/)
- Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)

## Setup

  ```sh
  - git clone https://github.com/mohamedsherif95/restaurant-app.git
  - cd restaurant-app
  ```


## Execution

```sh
docker compose up --build
```

## API Documentation

```sh
http://localhost:3000/api
```

## Possible Enhancements

- Authentication and role based authorization
- Add cache, cache invalidation, and pagination to other consuming endpoints such as (get all orders)
- Implement SOLID conforming design updates such as the abstract repository design pattern
- Add more reports and insight specific endpoints such as customer/order frequency and sale/price analyses
- Add unit tests and global error handling
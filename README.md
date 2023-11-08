npm scripts
- `npm run db:reset` - create database and role with `psql` utility. Current user must have appropriate permissions
- `npm run db:create-tables` - execute `create-tables.sql`, create tables and set permissions for the role
- `npm run start:user` - run 'users' service
- `npm run start:history` - run 'history' service
- `npm run seed` - send some requests to running services, to populate database with data
- `npm run test` - run test. Test creates its own role and database before running with `psql` utility, current user must have appropriate permissions

.env files
- `history-service/.env` - database PG-vars, queue name, port
- `user-service/.env` - same content, but different port
- `__tests__/.env` - services ports, different PG-vars and queue name for test
- `bin/.env` - services ports

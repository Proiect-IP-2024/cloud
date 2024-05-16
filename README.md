# cloud

use `npm install` => installing dependencies

use `npm run dev` => starting development environment

use `npm run build` => building for production in ./dist folder

use `npm run start-db` => for starting db

use `npm run stop-db` => for stop db docker container

use `npm run restart-db` => for rebuilding db container

! IMPORTANT ! 

DOCKER SHOULD RUN when exec:
    `npm run start-db`
    `npm run stop-db`
    `npm run restart-db`
`database_dump.sql` should keep this name for importing db
After every change of `database_dump.sql` use `npm run restart-db` for getting lattest version of db

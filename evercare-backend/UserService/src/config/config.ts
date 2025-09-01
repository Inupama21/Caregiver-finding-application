import {DataSource} from "typeorm";
import path from "path";


const datasource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "inupost",
    synchronize: true,
    database: "user_service_db",
    logging: true,
    entities: [path.join(__dirname , ".." , "models/**/*.ts")],
});

export default datasource;
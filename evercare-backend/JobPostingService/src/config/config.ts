import { DataSource } from "typeorm";
import path from "path";
import { PostEntity } from "../models/post";
import { NotificationEntity } from "../models/notifications";
const datasource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "inupost",
  synchronize: true,
  database: "jobposting_service_db",
  logging: true,
  entities: [PostEntity, NotificationEntity],
});

export default datasource;

// const typeorm = require ("typeorm");
// const path= require("path");

// const datasource = new typeorm.DataSource({
//     type: "postgres",
//     host: "localhost",
//     port: "5432",
//     username: "postgres",
//     password: "inupost",
//     synchronize: true,
//     database: "post_creation_db",
//     logging: true,
//     entities: [path.join(__dirname , ".." , "models/**/*.js")],
// });

// module.exports = datasource;

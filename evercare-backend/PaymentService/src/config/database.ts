import { DataSource } from "typeorm";
import { PaymentEntity } from "../models/Payment";

const datasource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "inupost",
    synchronize: true,
    database: process.env.DB_NAME || "payment_service_db",
    logging: true,
    entities: [PaymentEntity],
});

export default datasource;

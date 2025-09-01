import { DataSource } from "typeorm";
import { BookingEntity } from "../model/booking";

const datasource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "inupost",
    synchronize: true,
    database: process.env.DB_NAME || "booking_service_db",
    logging: true,
    entities: [BookingEntity],
});

export default datasource;

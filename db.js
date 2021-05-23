const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
    process.env.DB_NAME, // Name of your database
    process.env.USERNAME, //Username in your db
    process.env.PASSWORD, // Password of your DB
    {
        host: process.env.HOST, // Host (IP) of your DB
        port: process.env.PORT, //Port of your DB
        dialect: 'postgres' //Dialect of db (MySQL, Postgres, etc...)
    }
)

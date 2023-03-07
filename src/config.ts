const config = {
    rabbitMQ: {
        url: 'amqp://rabbitmq:5672',
        exchangeName: 'microserviceExchange'
    },
    express: {    
        httpPort: typeof process != "undefined" ? process?.env?.HTTP_PORT : 8111,
        hostname: typeof process != "undefined" ? process?.env?.HOSTNAME : 'localhost'
    },
}

const callService = {
    baseUrl: `http://${config.express.hostname}:${config.express.httpPort}`
}
export default {...config, callService}
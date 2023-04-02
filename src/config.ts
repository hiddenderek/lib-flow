const config = {
    rabbitMQ: {
        url: 'amqp://rabbitmq:5672',
        testUrl: 'amqp://localhost:5672',
        exchangeName: 'microserviceExchange'
    },
    opa: {
        url: 'http://opa:8181'
    },
    flow: {
        version: 0,
        token: 'super-secret'
    },
    host: {    
        port: process.env?.HTTP_PORT ? process.env.HTTP_PORT : 8111,
        hostname: process.env?.HTTP_PORT ? process.env.HOSTNAME : 'localhost'
    },
}
export default config
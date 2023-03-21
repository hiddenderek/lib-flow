const config = {
    rabbitMQ: {
        url: 'amqp://rabbitmq:5672',
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
        port: typeof process != "undefined" ? process?.env?.HTTP_PORT : 8111,
        hostname: typeof process != "undefined" ? process?.env?.HOSTNAME : 'localhost'
    },
}
export default config
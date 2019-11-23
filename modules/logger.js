const { createLogger, format, transports } = require('winston');
const { combine, timestamp, align, printf } = format;

const logger = createLogger({

  format: combine(
    timestamp({ format: 'YYYY-MM-DD [at] HH:mm:ss' }),
    align(),
    printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),

  transports: [
      new transports.File({filename: 'logs/errors.log', level: "warn", handleExceptions: true}),
      new transports.File({filename: 'logs/eyir.log', level: "info"})
    ],
  exitOnError: false
})

exports.log = logger;
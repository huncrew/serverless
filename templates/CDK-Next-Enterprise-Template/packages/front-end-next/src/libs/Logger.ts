import pino from 'pino';


let options = {};
  options = {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  };


export const logger = pino(options);

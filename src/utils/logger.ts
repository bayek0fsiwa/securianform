type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const log = (level: LogLevel, message: string): void => {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${level}: ${message}`;
    if (level === 'ERROR') {
        console.error(line);
    } else if (level === 'WARN') {
        console.warn(line);
    } else {
        console.log(line);
    }
};

export const logger = (message: string): void => log('INFO', message);
export const logWarn = (message: string): void => log('WARN', message);
export const logError = (message: string): void => log('ERROR', message);

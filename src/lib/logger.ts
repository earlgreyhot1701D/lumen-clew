// Lumen Clew - Simple Console Logger
// Provides consistent logging with prefixes and timestamps

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
};

const RESET = '\x1b[0m';
const PREFIX = '[LumenClew]';

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = formatTimestamp();
  const levelUpper = level.toUpperCase().padEnd(5);
  return `${timestamp} ${PREFIX} ${levelUpper} ${message}`;
}

export const logger = {
  debug(message: string, data?: unknown): void {
    if (import.meta.env.DEV) {
      console.debug(formatMessage('debug', message), data ?? '');
    }
  },

  info(message: string, data?: unknown): void {
    console.info(formatMessage('info', message), data ?? '');
  },

  warn(message: string, data?: unknown): void {
    console.warn(formatMessage('warn', message), data ?? '');
  },

  error(message: string, data?: unknown): void {
    console.error(formatMessage('error', message), data ?? '');
  },

  // Utility for timing operations
  time(label: string): () => void {
    const start = performance.now();
    logger.debug(`Timer started: ${label}`);
    
    return () => {
      const duration = (performance.now() - start).toFixed(2);
      logger.debug(`Timer ended: ${label} (${duration}ms)`);
    };
  },
};

export default logger;

import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SUCCESS = 4
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  debug(message: string): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
    }
  }

  info(message: string): void {
    if (this.level <= LogLevel.INFO) {
      console.log(chalk.blue(`[INFO] ${message}`));
    }
  }

  warn(message: string): void {
    if (this.level <= LogLevel.WARN) {
      console.log(chalk.yellow(`[WARN] ${message}`));
    }
  }

  error(message: string): void {
    if (this.level <= LogLevel.ERROR) {
      console.log(chalk.red(`[ERROR] ${message}`));
    }
  }

  success(message: string): void {
    if (this.level <= LogLevel.SUCCESS) {
      console.log(chalk.green(`[SUCCESS] ${message}`));
    }
  }

  plain(message: string): void {
    console.log(message);
  }

  table(data: any[]): void {
    console.table(data);
  }
}

export const logger = new Logger();

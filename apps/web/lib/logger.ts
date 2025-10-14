/**
 * Logger centralisé pour l'application
 * Gère les logs en développement et les envoie à un service de monitoring en production
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

class Logger {
  private log(
    level: LogLevel,
    message: string,
    error?: unknown,
    context?: LogContext
  ) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      context,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
    };

    // En développement, afficher dans la console
    if (process.env.NODE_ENV === "development") {
      const consoleMethod = level === "error" ? "error" : "log";
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, {
        ...logData,
      });
    } else {
      // En production, normaliser pour le monitoring
      console[level === "error" ? "error" : "log"](JSON.stringify(logData));
    }

    // En production, envoyer à un service de monitoring (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === "production" && level === "error") {
      // TODO: Intégrer avec votre service de monitoring
      // Exemple: Sentry.captureException(error, { contexts: { custom: context } });
    }
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, undefined, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, undefined, context);
  }

  error(message: string, error?: unknown, context?: LogContext) {
    this.log("error", message, error, context);
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, undefined, context);
    }
  }
}

export const logger = new Logger();

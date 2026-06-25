import { Action, ActionType, ActionPayload } from '../types/schema';

export type ActionHandler = (payload: ActionPayload) => void | Promise<void>;

interface ActionDispatcherConfig {
  handlers: Partial<Record<ActionType, ActionHandler>>;
  fallbackHandler?: (action: Action) => void;
}

class ActionDispatcherService {
  private handlers: Partial<Record<ActionType, ActionHandler>> = {};
  private fallbackHandler?: (action: Action) => void;
  private actionLog: Action[] = [];

  constructor(config?: ActionDispatcherConfig) {
    if (config?.handlers) {
      this.handlers = config.handlers;
    }
    this.fallbackHandler = config?.fallbackHandler;
  }

  registerHandler(type: ActionType, handler: ActionHandler): void {
    this.handlers[type] = handler;
  }

  removeHandler(type: ActionType): void {
    delete this.handlers[type];
  }

  async dispatch(action: Action): Promise<void> {
    this.actionLog.push(action);

    if (__DEV__) {
      console.log(`[ActionDispatcher] Dispatching: ${action.type}`, action.payload);
    }

    const handler = this.handlers[action.type];

    if (handler) {
      try {
        await handler(action.payload);
      } catch (error) {
        console.error(`[ActionDispatcher] Handler error for ${action.type}:`, error);
        this.handleError(error as Error, action);
      }
    } else if (this.fallbackHandler) {
      this.fallbackHandler(action);
    } else {
      console.warn(`[ActionDispatcher] No handler registered for action type: ${action.type}`);
    }
  }

  private handleError(error: Error, action: Action): void {
    if (__DEV__) {
      console.error('Action dispatch error:', { action, error });
    }
  }

  getActionLog(): Action[] {
    return [...this.actionLog];
  }

  clearLog(): void {
    this.actionLog = [];
  }
}

export const createActionDispatcher = (config?: ActionDispatcherConfig): ActionDispatcherService => {
  return new ActionDispatcherService(config);
};

export { ActionDispatcherService };

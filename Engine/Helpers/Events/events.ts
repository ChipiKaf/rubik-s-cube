type EventHandler = (...args: any[]) => void;

export default class EventEmitter {
  private events: Record<string, EventHandler[]> = {};

  // Add an event listener
  on(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  // Remove an event listener
  off(event: string, handler: EventHandler): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(h => h !== handler);
    }
  }

  // Trigger all handlers for an event
  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(...args));
    }
  }
}

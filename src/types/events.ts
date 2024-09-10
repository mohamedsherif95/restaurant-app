export class CacheInvalidatedEvent {
    public static eventName = 'cache.invalidated';
    constructor(
      public key: string,
    ) {}
  }
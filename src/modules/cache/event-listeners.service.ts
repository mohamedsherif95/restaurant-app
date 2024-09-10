import { Injectable } from '@nestjs/common';
import { OnEvent } from "@nestjs/event-emitter";
import { CacheInvalidatedEvent } from '../../types/events';
import { CacheService } from './cache.service';

@Injectable()
export class EventListenerService {
  constructor(
    private readonly cacheService: CacheService,
  ) {}

  @OnEvent(CacheInvalidatedEvent.eventName)
  async handleJobDeleted(event: CacheInvalidatedEvent) {
    return this.cacheService.deleteKey(event.key);
  }
}

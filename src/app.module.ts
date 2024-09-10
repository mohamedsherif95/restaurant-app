import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './modules/orders/orders.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './modules/cache/cache.service';
import { redisConfigs } from './configs/constants';
import { EventListenerService } from './modules/cache/event-listeners.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: redisConfigs.TTL,
      max: redisConfigs.MAX,
      isGlobal: true
    }),
    EventEmitterModule.forRoot(),
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService, CacheService, EventListenerService],
  exports: [CacheService]
})
export class AppModule {}

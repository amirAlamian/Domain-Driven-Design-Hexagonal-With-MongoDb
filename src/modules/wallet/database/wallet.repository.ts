import { z } from 'zod';
import { MongoRepositoryBase } from '@src/libs/db/mongo-repository.base';
import { WalletRepositoryPort } from './wallet.repository.port';
import { WalletEntity } from '../domain/wallet.entity';
import { WalletMapper } from '../wallet.mapper';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from 'nestjs-prisma';
import { wallets } from '@prisma/client';

export const walletSchema = z.object({
  id: z.string().min(1).max(255),
  createdAt: z.preprocess((val: any) => new Date(val), z.date()),
  updatedAt: z.preprocess((val: any) => new Date(val), z.date()),
  balance: z.number().min(0).max(9999999),
  userId: z.string().min(1).max(255),
});

export type WalletModel = wallets;

@Injectable()
export class WalletRepository
  extends MongoRepositoryBase<WalletEntity, WalletModel>
  implements WalletRepositoryPort
{
  protected tableName = 'wallets';

  protected schema = walletSchema;

  constructor(
    prisma: PrismaService,
    mapper: WalletMapper,
    eventEmitter: EventEmitter2,
  ) {
    super(prisma, mapper, eventEmitter, new Logger(WalletRepository.name));
  }
}

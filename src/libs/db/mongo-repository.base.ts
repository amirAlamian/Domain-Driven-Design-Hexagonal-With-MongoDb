import { RequestContextService } from '@libs/application/context/AppRequestContext';
import { AggregateRoot, PaginatedQueryParams, Paginated } from '@libs/ddd';
import { Mapper } from '@libs/ddd';
import { RepositoryPort } from '@libs/ddd';
import { ConflictException } from '@libs/exceptions';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { None, Option, Some } from 'oxide.ts';
import { LoggerPort } from '../ports/logger.port';
import { ObjectLiteral, PrismaTransaction } from '../types';
import { PrismaService } from 'nestjs-prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export abstract class MongoRepositoryBase<
  Aggregate extends AggregateRoot<any>,
  DbModel extends ObjectLiteral,
> implements RepositoryPort<Aggregate>
{
  protected abstract tableName: string;

  protected constructor(
    protected readonly prisma: PrismaService,
    protected readonly mapper: Mapper<Aggregate, DbModel>,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly logger: LoggerPort,
  ) {}

  async findOneById(id: string): Promise<Option<Aggregate>> {
    const result = await this.prisma[this.tableName].findUnique({
      where: {
        id,
      },
    });
    return result ? Some(this.mapper.toDomain(result)) : None;
  }

  async findAll(): Promise<Aggregate[]> {
    const result = await this.prisma[this.tableName].findMany();

    return result.map(this.mapper.toDomain);
  }

  async findAllPaginated(
    params: PaginatedQueryParams,
  ): Promise<Paginated<Aggregate>> {
    const result = await this.prisma[this.tableName].findMany({
      take: params.limit,
      skip: params.offset,
    });

    const entities = result.map(this.mapper.toDomain);
    return new Paginated({
      data: entities,
      count: entities.length,
      limit: params.limit,
      page: params.page,
    });
  }

  async delete(
    entity: Aggregate,
    prismaTransaction?: PrismaTransaction,
  ): Promise<boolean> {
    entity.validate();
    const record = this.mapper.toPersistence(entity);

    const result = await this.transactionChecker(prismaTransaction)[
      this.tableName
    ].deleteMany({
      where: record,
    });

    this.logger.debug(
      `[${RequestContextService.getRequestId()}] deleting entities ${
        entity.id
      } from ${this.tableName}`,
    );

    await entity.publishEvents(this.logger, this.eventEmitter);

    return result.count > 0;
  }

  /**
   * Inserts an entity to a database
   * (also publishes domain events and waits for completion)
   */
  async insert(
    entity: Aggregate | Aggregate[],
    prismaTransaction?: PrismaTransaction,
  ): Promise<void> {
    const entities = Array.isArray(entity) ? entity : [entity];

    const records = entities.map(this.mapper.toPersistence);

    try {
      await this.transactionChecker(prismaTransaction)[
        this.tableName
      ].createMany({
        data: records,
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // this code means unique constraint failure
          this.logger.debug(
            `[${RequestContextService.getRequestId()}] ${error.message}`,
          );
          throw new ConflictException('Record already exists', error);
        }
      }
      throw error;
    }
  }

  updateOneById = async (id: string, entity: Aggregate): Promise<void> => {
    const record = this.mapper.toPersistence(entity);

    await this.prisma.users.update({
      where: {
        id,
      },
      data: record,
    });
  };

  /**
   * start a global transaction to save
   * results of all event handlers in one operation
   */
  public async transaction<T>(
    handler: (prismaTransaction: PrismaTransaction) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(async (prisma) => {
      this.logger.debug(
        `[${RequestContextService.getRequestId()}] transaction started`,
      );
      try {
        const result = await handler(prisma);
        this.logger.debug(
          `[${RequestContextService.getRequestId()}] transaction committed`,
        );
        return result;
      } catch (e) {
        this.logger.debug(
          `[${RequestContextService.getRequestId()}] transaction aborted`,
        );
        throw e;
      }
    });
  }

  private transactionChecker = (prismaTransaction?: PrismaTransaction) => {
    return prismaTransaction ? prismaTransaction : this.prisma;
  };
}

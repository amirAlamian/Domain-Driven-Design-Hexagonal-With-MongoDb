import { PrismaTransaction } from '@src/libs/types';
import { Option } from 'oxide.ts';

/*  Most of repositories will probably need generic 
    save/find/delete operations, so it's easier
    to have some shared interfaces.
    More specific queries should be defined
    in a respective repository.
*/

export class Paginated<T> {
  readonly count: number;
  readonly limit: number;
  readonly page: number;
  readonly data: readonly T[];

  constructor(props: Paginated<T>) {
    this.count = props.count;
    this.limit = props.limit;
    this.page = props.page;
    this.data = props.data;
  }
}

export type OrderBy = { [field: string]: 'asc' | 'desc' };

export type PaginatedQueryParams = {
  limit: number;
  page: number;
  offset: number;
  orderBy: OrderBy;
};

export interface RepositoryPort<Entity> {
  insert(
    entity: Entity | Entity[],
    prismaTransaction?: PrismaTransaction,
  ): Promise<void>;
  findOneById(id: string): Promise<Option<Entity>>;
  findAll(): Promise<Entity[]>;
  findAllPaginated(params: PaginatedQueryParams): Promise<Paginated<Entity>>;
  delete(
    entity: Entity,
    prismaTransaction?: PrismaTransaction,
  ): Promise<boolean>;

  updateOneById(id: string, entity: Entity): Promise<void>;
  transaction<T>(
    handler: (prismaTransaction: PrismaTransaction) => Promise<T>,
  ): Promise<T>;
}

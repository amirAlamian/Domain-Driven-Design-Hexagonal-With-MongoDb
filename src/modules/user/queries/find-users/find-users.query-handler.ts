import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Ok, Result } from 'oxide.ts';
import { PaginatedParams, PaginatedQueryBase } from '@libs/ddd/query.base';
import { Paginated } from '@src/libs/ddd';
import { UserModel } from '../../database/user.repository';
import { PrismaService } from 'nestjs-prisma';

export class FindUsersQuery extends PaginatedQueryBase {
  readonly country?: string;

  readonly postalCode?: string;

  readonly street?: string;

  constructor(props: PaginatedParams<FindUsersQuery>) {
    super(props);
    this.country = props.country;
    this.postalCode = props.postalCode;
    this.street = props.street;
  }
}

@QueryHandler(FindUsersQuery)
export class FindUsersQueryHandler implements IQueryHandler {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * In read model we don't need to execute
   * any business logic, so we can bypass
   * domain and repository layers completely
   * and execute query directly
   */
  async execute(
    query: FindUsersQuery,
  ): Promise<Result<Paginated<UserModel>, Error>> {
    const { limit, offset, orderBy, ...rest } = query;
    Reflect.deleteProperty(rest, 'page');
    const records = await this.prisma.users.findMany({
      where: rest,
      skip: offset,
      take: limit,
      orderBy,
    });

    return Ok(
      new Paginated({
        data: records,
        count: records.length,
        limit: query.limit,
        page: query.page,
      }),
    );
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { PaginatedQueryRequestDto } from '@src/libs/api/paginated-query.request.dto';
import {
  MaxLength,
  IsString,
  IsAlphanumeric,
  Matches,
  IsOptional,
} from 'class-validator';

export class FindUsersRequestDto extends PaginatedQueryRequestDto {
  @ApiProperty({
    example: 'France',
    description: 'Country of residence',
    required: false,
  })
  @IsOptional()
  @MaxLength(50)
  @IsString()
  @Matches(/^[a-zA-Z ]*$/)
  readonly country?: string;

  @ApiProperty({
    example: '28566',
    description: 'Postal code',
    required: false,
  })
  @IsOptional()
  @MaxLength(10)
  @IsAlphanumeric()
  readonly postalCode?: string;

  @ApiProperty({
    example: 'Grande Rue',
    description: 'Street',
    required: false,
  })
  @IsOptional()
  @MaxLength(50)
  @Matches(/^[a-zA-Z ]*$/)
  readonly street?: string;
}

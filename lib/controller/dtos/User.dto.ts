import {Exclude, Expose, Transform} from 'class-transformer';

export class UserDto {
  // Cannot send as object since we use plainToInstance in serialize
  @Expose()
    phoneNumber: string;

  @Expose()
    email: string;

  @Expose()
    firstName: string;

  @Expose()
    lastName: string;


  @Expose()
    isBlocked: boolean;

  @Transform(({ obj }) => obj.lastLocation.coordinates[0])
  @Expose()
    lastLongitude: number;

  @Transform(({ obj }) => obj.lastLocation.coordinates[1])
  @Expose()
    lastLatitude: number;

  @Expose()
    signedUp: boolean;

  @Expose()
    id: string;

  @Exclude()
    refreshToken: string;
}
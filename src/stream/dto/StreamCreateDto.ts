import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class StreamCreateDto {
    @IsNotEmpty({ message: 'songId обов’язковий' })
    @IsString()
    songId!: string;

    @IsNotEmpty({ message: 'userId обов’язковий' })
    @IsString()
    userId!: string;
}
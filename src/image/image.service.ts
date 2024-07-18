import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImageService {
  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'),
  });
  constructor(private readonly configService: ConfigService) {}

  async upload(fileName: string, file: Buffer): Promise<string> {
    const bucketName = this.configService.get<string>('S3_BUCKET_NAME');
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: file,
      }),
    );

    return `https://${bucketName}.s3.${this.configService.getOrThrow(
      'AWS_S3_REGION',
    )}.amazonaws.com/${fileName}`;
  }
}

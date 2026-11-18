
import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider.js';

@Module({
  providers: [CloudinaryProvider],
  exports: [CloudinaryProvider],
})
export class CloudinaryModule {}

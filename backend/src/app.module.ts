
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GitModule } from './git/git.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [GitModule, ReviewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

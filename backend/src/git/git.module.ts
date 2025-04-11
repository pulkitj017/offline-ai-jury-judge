import { Module, forwardRef } from '@nestjs/common';
import { GitController } from './git.controller';
import { GitService } from './git.service';
import { ReviewModule } from '../review/review.module';

@Module({
  imports: [forwardRef(() => ReviewModule)],
  controllers: [GitController],
  providers: [GitService],
  exports: [GitService]
})
export class GitModule {}

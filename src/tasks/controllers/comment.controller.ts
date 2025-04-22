import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { AccessLevel } from '../../auth/decorators/access-level.decorator';
import { AccessLevelGuard } from '../../auth/guards/access-level.guard';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/role.guard';
import { CommentService } from '../services/comment.service';
import { CreateCommentDTO, UpdateCommentDTO } from '../dto/comment.dto';
import { Request } from 'express';

// Extended request interface to include user property with sub field
interface RequestWithUser extends Request {
  user?: {
    sub: string;
    [key: string]: any;
  };
}

@ApiTags('Comments')
@Controller('comments')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'taskId',
  })
  @Get('task/:taskId')
  public async findCommentsByTaskId(@Param('taskId') taskId: string) {
    return this.commentService.findAllByTaskId(taskId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @Post()
  public async createComment(
    @Body() body: CreateCommentDTO,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.sub || '';
    return this.commentService.create(userId, body);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @Put(':id')
  public async updateComment(
    @Param('id') id: string,
    @Body() body: UpdateCommentDTO,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.sub || '';
    return this.commentService.update(id, userId, body);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @Delete(':id')
  public async deleteComment(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user?.sub || '';
    return this.commentService.remove(id, userId);
  }
}

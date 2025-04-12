import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { AttachmentService } from '../services/attachment.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/role.guard';
import { TeamRoleGuard } from '../../auth/guards/team-role.guard';
import { TeamRole } from '../../auth/decorators/team-role.decorator';
import { TEAM_ROLE } from '../../constants/team-role.enum';
import { Response } from 'express';
import * as fs from 'fs';

@ApiTags('Attachments')
@Controller('attachments')
@UseGuards(AuthGuard, RolesGuard)
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
  @Post('upload/:taskId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('taskId') taskId: string,
  ) {
    return this.attachmentService.uploadAttachment(file, taskId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'taskId',
  })
  @Get('task/:taskId')
  async getAttachmentsByTaskId(@Param('taskId') taskId: string) {
    return this.attachmentService.getAttachmentsByTaskId(taskId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @Get(':id/download')
  async downloadAttachment(@Param('id') id: string, @Res() res: Response) {
    const attachment = await this.attachmentService.getAttachmentById(id);

    if (!fs.existsSync(attachment.path)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${attachment.originalname}`,
    );
    res.setHeader('Content-Type', attachment.mimetype);

    const fileStream = fs.createReadStream(attachment.path);
    fileStream.pipe(res);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.MEMBER)
  @Delete(':id')
  async deleteAttachment(@Param('id') id: string) {
    await this.attachmentService.deleteAttachment(id);
    return { message: 'Attachment deleted successfully' };
  }
}

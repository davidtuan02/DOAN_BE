import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/role.guard';
import { BoardColumnService } from '../services/board-column.service';
import {
  CreateBoardColumnDTO,
  UpdateBoardColumnDTO,
  ReorderBoardColumnsDTO,
} from '../dto/board-column.dto';
import { TeamRoleGuard } from '../../auth/guards/team-role.guard';
import { TeamRole } from '../../auth/decorators/team-role.decorator';
import { TEAM_ROLE } from '../../constants/team-role.enum';

@ApiTags('Board Columns')
@Controller('board-columns')
@UseGuards(AuthGuard, RolesGuard)
export class BoardColumnController {
  constructor(private readonly boardColumnService: BoardColumnService) {}

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'boardId',
  })
  @Get('board/:boardId')
  public async findColumnsByBoardId(@Param('boardId') boardId: string) {
    return this.boardColumnService.findColumnsByBoardId(boardId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'projectId',
  })
  @Get('project/:projectId')
  public async findColumnsByProjectId(@Param('projectId') projectId: string) {
    return this.boardColumnService.findColumnsByProjectId(projectId);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Post()
  public async createColumn(@Body() body: CreateBoardColumnDTO) {
    return this.boardColumnService.createColumn(body);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Put('reorder')
  public async reorderColumns(@Body() body: ReorderBoardColumnsDTO) {
    return this.boardColumnService.reorderColumns(body);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Put(':id')
  public async updateColumn(
    @Param('id') id: string,
    @Body() body: UpdateBoardColumnDTO,
  ) {
    return this.boardColumnService.updateColumn(id, body);
  }

  @ApiHeader({
    name: 'tasks_token',
  })
  @ApiParam({
    name: 'id',
  })
  @UseGuards(TeamRoleGuard)
  @TeamRole(TEAM_ROLE.LEADER)
  @Delete(':id')
  public async deleteColumn(@Param('id') id: string) {
    return this.boardColumnService.deleteColumn(id);
  }
}

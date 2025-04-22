import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GoalsService } from '../services/goals.service';
import { CreateGoalDto } from '../dto/create-goal.dto';
import { UpdateGoalDto } from '../dto/update-goal.dto';
import { GoalResponseDto } from '../dto/goal-response.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ROLES } from '../../constants/roles-enum';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The goal has been successfully created.',
    type: GoalResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden.',
  })
  create(@Body() createGoalDto: CreateGoalDto): Promise<GoalResponseDto> {
    return this.goalsService.create(createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals' })
  @ApiQuery({
    name: 'projectId',
    required: false,
    description: 'Filter goals by project ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return all goals, optionally filtered by project ID',
    type: [GoalResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  findAll(@Query('projectId') projectId?: string): Promise<GoalResponseDto[]> {
    return this.goalsService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific goal by ID' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return the goal with specified ID',
    type: GoalResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Goal not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  findOne(@Param('id') id: string): Promise<GoalResponseDto> {
    return this.goalsService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Update a goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The goal has been successfully updated.',
    type: GoalResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Goal not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden.',
  })
  update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
  ): Promise<GoalResponseDto> {
    return this.goalsService.update(id, updateGoalDto);
  }

  @Delete(':id')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Delete a goal' })
  @ApiParam({ name: 'id', description: 'Goal ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'The goal has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Goal not found.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden.',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.goalsService.remove(id);
  }
}

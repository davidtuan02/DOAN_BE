import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamsEntity } from '../entities/teams.entity';
import { UsersEntity } from '../../users/entities/user.entity';
import { UsersTeamsEntity } from '../entities/usersTeams.entity';
import {
  CreateTeamDto,
  UpdateTeamDto,
  AddMemberToTeamDto,
  UpdateMemberRoleDto,
} from '../dto/team.dto';
import { TEAM_ROLE } from '../../constants/team-role.enum';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamsEntity)
    private readonly teamRepository: Repository<TeamsEntity>,
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    @InjectRepository(UsersTeamsEntity)
    private readonly userTeamRepository: Repository<UsersTeamsEntity>,
  ) {}

  async createTeam(
    userId: string,
    teamData: CreateTeamDto,
  ): Promise<TeamsEntity> {
    try {
      // Validate user exists
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const newTeam = this.teamRepository.create({
        ...teamData,
        createdBy: userId,
      });

      const team = await this.teamRepository.save(newTeam);

      try {
        // Add creator as team leader
        await this.addMemberToTeam(team.id, {
          userId,
          role: TEAM_ROLE.LEADER,
        });
      } catch (memberError) {
        console.error('Error adding user as team leader:', memberError);
        // Don't fail the whole operation if this step fails
      }

      return team;
    } catch (error) {
      console.error('Error in createTeam service:', error);
      throw error;
    }
  }

  async getTeamById(id: string): Promise<TeamsEntity> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['usersIncludes', 'usersIncludes.user'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async getAllTeams(): Promise<TeamsEntity[]> {
    return this.teamRepository.find({
      relations: ['usersIncludes', 'usersIncludes.user'],
    });
  }

  async updateTeam(id: string, teamData: UpdateTeamDto): Promise<TeamsEntity> {
    const team = await this.getTeamById(id);
    const updated = this.teamRepository.merge(team, teamData);
    return this.teamRepository.save(updated);
  }

  async deleteTeam(id: string): Promise<void> {
    const team = await this.getTeamById(id);
    await this.teamRepository.remove(team);
  }

  async addMemberToTeam(
    teamId: string,
    memberData: AddMemberToTeamDto,
  ): Promise<UsersTeamsEntity> {
    const { userId, role } = memberData;

    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user is already in the team
    const existingMember = await this.userTeamRepository.findOne({
      where: { user: { id: userId }, team: { id: teamId } },
    });

    if (existingMember) {
      existingMember.role = role;
      return this.userTeamRepository.save(existingMember);
    }

    const userTeam = this.userTeamRepository.create({
      user,
      team,
      role,
    });

    return this.userTeamRepository.save(userTeam);
  }

  async updateMemberRole(
    teamId: string,
    userId: string,
    roleData: UpdateMemberRoleDto,
  ): Promise<UsersTeamsEntity> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    const userTeam = await this.userTeamRepository.findOne({
      where: { user: { id: userId }, team: { id: teamId } },
      relations: ['user', 'team'],
    });

    if (!userTeam) {
      throw new NotFoundException(
        `User with ID ${userId} is not a member of team with ID ${teamId}`,
      );
    }

    userTeam.role = roleData.role;
    return this.userTeamRepository.save(userTeam);
  }

  async removeMemberFromTeam(teamId: string, userId: string): Promise<void> {
    const userTeam = await this.userTeamRepository.findOne({
      where: { user: { id: userId }, team: { id: teamId } },
    });

    if (!userTeam) {
      throw new NotFoundException(
        `User with ID ${userId} is not a member of team with ID ${teamId}`,
      );
    }

    await this.userTeamRepository.remove(userTeam);
  }

  async getTeamsByUserId(userId: string): Promise<TeamsEntity[]> {
    const userTeams = await this.userTeamRepository.find({
      where: { user: { id: userId } },
      relations: ['team', 'team.usersIncludes', 'team.usersIncludes.user'],
    });

    return userTeams.map((userTeam) => userTeam.team);
  }

  async getTeamMembers(teamId: string): Promise<UsersTeamsEntity[]> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    return this.userTeamRepository.find({
      where: { team: { id: teamId } },
      relations: ['user'],
    });
  }

  async isUserMemberOfTeam(userId: string, teamId: string): Promise<boolean> {
    const userTeam = await this.userTeamRepository.findOne({
      where: { user: { id: userId }, team: { id: teamId } },
    });

    return !!userTeam;
  }

  async getUserRoleInTeam(
    userId: string,
    teamId: string,
  ): Promise<TEAM_ROLE | null> {
    const userTeam = await this.userTeamRepository.findOne({
      where: { user: { id: userId }, team: { id: teamId } },
    });

    if (!userTeam) {
      return null;
    }

    return userTeam.role;
  }

  async getTeamProjects(teamId: string): Promise<any[]> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['projects'],
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${teamId} not found`);
    }

    return team.projects;
  }

  async getAvailableUsersForTeam(teamId: string): Promise<UsersEntity[]> {
    // Find all users that are not members of the specified team

    // Get all users
    const allUsers = await this.userRepository.find();

    // Get current team members
    const teamMembers = await this.getTeamMembers(teamId);
    const memberUserIds = teamMembers.map((member) => member.user.id);

    // Filter out users who are already team members
    const availableUsers = allUsers.filter(
      (user) => !memberUserIds.includes(user.id),
    );

    return availableUsers;
  }
}

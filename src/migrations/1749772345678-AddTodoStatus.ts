import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTodoStatus1749772345678 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, update existing CREATED status to TODO
        await queryRunner.query(`UPDATE task SET status = 'TODO' WHERE status = 'CREATED'`);
        
        // Then alter the enum type to add TODO
        await queryRunner.query(`
            ALTER TYPE task_status_enum ADD VALUE IF NOT EXISTS 'TODO';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert CREATED status
        await queryRunner.query(`UPDATE task SET status = 'CREATED' WHERE status = 'TODO'`);
        
        // Note: Cannot remove enum values in PostgreSQL, so we can't remove TODO from the enum
    }
} 
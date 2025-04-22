import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1745326903052 implements MigrationInterface {
    name = 'Init1745326903052'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "board_columns" ADD "color" character varying`);
        await queryRunner.query(`ALTER TABLE "board_columns" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "board_columns" ADD "is_default" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "board_columns" DROP COLUMN "is_default"`);
        await queryRunner.query(`ALTER TABLE "board_columns" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "board_columns" DROP COLUMN "color"`);
    }

}

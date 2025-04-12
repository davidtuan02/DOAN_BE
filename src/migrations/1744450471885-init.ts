import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1744450471885 implements MigrationInterface {
    name = 'Init1744450471885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ADD "is_subtask" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "task" ADD "parent_id" uuid`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_5b12d07794e1d6428696b35fd7e" FOREIGN KEY ("parent_id") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_5b12d07794e1d6428696b35fd7e"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "parent_id"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "is_subtask"`);
    }

}

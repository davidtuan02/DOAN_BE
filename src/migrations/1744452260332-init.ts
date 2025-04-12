import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1744452260332 implements MigrationInterface {
    name = 'Init1744452260332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ADD "parent_task_id" uuid`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_01c122fbf6a1e855a2622957f5f" FOREIGN KEY ("parent_task_id") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_01c122fbf6a1e855a2622957f5f"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "parent_task_id"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1743373295704 implements MigrationInterface {
    name = 'Init1743373295704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_0005dde59b747e4cc625d72c5a8"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."task_type_enum"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "priority"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "story_points"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "labels"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "team_id"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "sprint_id"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "sprint_name"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "due_date"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "reporter_id"`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "task_description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "responsable_name" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "responsable_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "task_description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task" ADD "reporter_id" uuid`);
        await queryRunner.query(`ALTER TABLE "task" ADD "due_date" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "task" ADD "sprint_name" character varying`);
        await queryRunner.query(`ALTER TABLE "task" ADD "sprint_id" character varying`);
        await queryRunner.query(`ALTER TABLE "task" ADD "team_id" character varying`);
        await queryRunner.query(`ALTER TABLE "task" ADD "labels" json`);
        await queryRunner.query(`ALTER TABLE "task" ADD "story_points" integer`);
        await queryRunner.query(`ALTER TABLE "task" ADD "priority" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."task_type_enum" AS ENUM('TASK', 'BUG', 'STORY')`);
        await queryRunner.query(`ALTER TABLE "task" ADD "type" "public"."task_type_enum" NOT NULL DEFAULT 'TASK'`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_0005dde59b747e4cc625d72c5a8" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1743371822304 implements MigrationInterface {
    name = 'Init1743371822304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_0005dde59b747e4cc625d72c5a8"`);
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_39a45858417b1934dc8bac943c2"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."task_type_enum"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "sprint_id"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "story_points"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "labels"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "reporter_id"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "team_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ADD "team_id" uuid`);
        await queryRunner.query(`ALTER TABLE "task" ADD "reporter_id" uuid`);
        await queryRunner.query(`ALTER TABLE "task" ADD "labels" text`);
        await queryRunner.query(`ALTER TABLE "task" ADD "story_points" integer`);
        await queryRunner.query(`ALTER TABLE "task" ADD "sprint_id" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."task_type_enum" AS ENUM('TASK', 'BUG', 'STORY')`);
        await queryRunner.query(`ALTER TABLE "task" ADD "type" "public"."task_type_enum" NOT NULL DEFAULT 'TASK'`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_39a45858417b1934dc8bac943c2" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_0005dde59b747e4cc625d72c5a8" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

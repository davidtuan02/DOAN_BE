import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1743365637911 implements MigrationInterface {
    name = 'Init1743365637911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP CONSTRAINT "FK_ec30ef94c7d981113563d91472b"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."task_type_enum"`);
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "creator_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ADD "creator_id" uuid`);
        await queryRunner.query(`CREATE TYPE "public"."task_type_enum" AS ENUM('TASK', 'BUG', 'STORY')`);
        await queryRunner.query(`ALTER TABLE "task" ADD "type" "public"."task_type_enum" NOT NULL DEFAULT 'TASK'`);
        await queryRunner.query(`ALTER TABLE "task" ADD CONSTRAINT "FK_ec30ef94c7d981113563d91472b" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

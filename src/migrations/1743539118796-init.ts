import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1743539118796 implements MigrationInterface {
    name = 'Init1743539118796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."task_status_enum" RENAME TO "task_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."task_status_enum" AS ENUM('CREATED', 'IN_PROGRESS', 'REVIEW', 'FINISH')`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "status" TYPE "public"."task_status_enum" USING "status"::"text"::"public"."task_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."task_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."task_status_enum_old" AS ENUM('CREATED', 'IN_PROGRESS', 'FINISH')`);
        await queryRunner.query(`ALTER TABLE "task" ALTER COLUMN "status" TYPE "public"."task_status_enum_old" USING "status"::"text"::"public"."task_status_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."task_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."task_status_enum_old" RENAME TO "task_status_enum"`);
    }

}

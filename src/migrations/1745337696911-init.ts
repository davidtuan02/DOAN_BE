import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1745337696911 implements MigrationInterface {
    name = 'Init1745337696911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."users_projects_access_level_enum" RENAME TO "users_projects_access_level_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_projects_access_level_enum" AS ENUM('20', '30', '40', '50')`);
        await queryRunner.query(`ALTER TABLE "users_projects" ALTER COLUMN "access_level" TYPE "public"."users_projects_access_level_enum" USING "access_level"::"text"::"public"."users_projects_access_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_projects_access_level_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_projects_access_level_enum_old" AS ENUM('30', '40', '50')`);
        await queryRunner.query(`ALTER TABLE "users_projects" ALTER COLUMN "access_level" TYPE "public"."users_projects_access_level_enum_old" USING "access_level"::"text"::"public"."users_projects_access_level_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_projects_access_level_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_projects_access_level_enum_old" RENAME TO "users_projects_access_level_enum"`);
    }

}

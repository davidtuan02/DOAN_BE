import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1747498959440 implements MigrationInterface {
    name = 'Init1747498959440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."goals_status_enum" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'AT_RISK')`);
        await queryRunner.query(`CREATE TABLE "goals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "status" "public"."goals_status_enum" NOT NULL DEFAULT 'NOT_STARTED', "progress" numeric(5,2) NOT NULL DEFAULT '0', "start_date" date, "due_date" date, "project_id" uuid NOT NULL, "owner_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_26e17b251afab35580dff769223" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "age"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "full_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."users_projects_access_level_enum" RENAME TO "users_projects_access_level_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_projects_access_level_enum" AS ENUM('20', '30', '40', '50')`);
        await queryRunner.query(`ALTER TABLE "users_projects" ALTER COLUMN "access_level" TYPE "public"."users_projects_access_level_enum" USING "access_level"::"text"::"public"."users_projects_access_level_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_projects_access_level_enum_old"`);
        await queryRunner.query(`ALTER TABLE "goals" ADD CONSTRAINT "FK_3aeb7c781bece54e5ae6ace912e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "goals" ADD CONSTRAINT "FK_5be99af79326ab0721c5b326534" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "goals" DROP CONSTRAINT "FK_5be99af79326ab0721c5b326534"`);
        await queryRunner.query(`ALTER TABLE "goals" DROP CONSTRAINT "FK_3aeb7c781bece54e5ae6ace912e"`);
        await queryRunner.query(`CREATE TYPE "public"."users_projects_access_level_enum_old" AS ENUM('30', '40', '50')`);
        await queryRunner.query(`ALTER TABLE "users_projects" ALTER COLUMN "access_level" TYPE "public"."users_projects_access_level_enum_old" USING "access_level"::"text"::"public"."users_projects_access_level_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_projects_access_level_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_projects_access_level_enum_old" RENAME TO "users_projects_access_level_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "full_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "age" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "last_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "first_name" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "goals"`);
        await queryRunner.query(`DROP TYPE "public"."goals_status_enum"`);
    }

}

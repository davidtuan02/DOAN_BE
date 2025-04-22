import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1745355017270 implements MigrationInterface {
    name = 'Init1745355017270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."goals_status_enum" AS ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'AT_RISK')`);
        await queryRunner.query(`CREATE TYPE "public"."goals_timeframe_enum" AS ENUM('Q1', 'Q2', 'Q3', 'Q4', 'YEARLY', 'CUSTOM')`);
        await queryRunner.query(`CREATE TABLE "goals" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "status" "public"."goals_status_enum" NOT NULL DEFAULT 'NOT_STARTED', "progress" numeric(5,2) NOT NULL DEFAULT '0', "timeframe" "public"."goals_timeframe_enum" NOT NULL DEFAULT 'Q1', "start_date" date, "due_date" date, "year" integer NOT NULL DEFAULT '0', "project_id" uuid NOT NULL, "owner_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_26e17b251afab35580dff769223" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "goals" ADD CONSTRAINT "FK_3aeb7c781bece54e5ae6ace912e" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "goals" ADD CONSTRAINT "FK_5be99af79326ab0721c5b326534" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "goals" DROP CONSTRAINT "FK_5be99af79326ab0721c5b326534"`);
        await queryRunner.query(`ALTER TABLE "goals" DROP CONSTRAINT "FK_3aeb7c781bece54e5ae6ace912e"`);
        await queryRunner.query(`DROP TABLE "goals"`);
        await queryRunner.query(`DROP TYPE "public"."goals_timeframe_enum"`);
        await queryRunner.query(`DROP TYPE "public"."goals_status_enum"`);
    }

}

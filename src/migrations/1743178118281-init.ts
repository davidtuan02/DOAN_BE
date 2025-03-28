import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1743178118281 implements MigrationInterface {
    name = 'Init1743178118281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "task_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."users_teams_role_enum" RENAME TO "users_teams_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_teams_role_enum" AS ENUM('leader', 'member', 'admin')`);
        await queryRunner.query(`ALTER TABLE "users_teams" ALTER COLUMN "role" TYPE "public"."users_teams_role_enum" USING "role"::"text"::"public"."users_teams_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_teams_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_18c2493067c11f44efb35ca0e03" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_18c2493067c11f44efb35ca0e03"`);
        await queryRunner.query(`CREATE TYPE "public"."users_teams_role_enum_old" AS ENUM('leader', 'member')`);
        await queryRunner.query(`ALTER TABLE "users_teams" ALTER COLUMN "role" TYPE "public"."users_teams_role_enum_old" USING "role"::"text"::"public"."users_teams_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."users_teams_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_teams_role_enum_old" RENAME TO "users_teams_role_enum"`);
        await queryRunner.query(`DROP TABLE "comments"`);
    }

}

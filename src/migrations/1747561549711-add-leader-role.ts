import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLeaderRole1747561549711 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo enum mới với LEADER role
        await queryRunner.query(`
            ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old";
            CREATE TYPE "public"."users_role_enum" AS ENUM('BASIC', 'ADMIN', 'LEADER');
            ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::text::"public"."users_role_enum";
            DROP TYPE "public"."users_role_enum_old";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Khôi phục lại enum cũ
        await queryRunner.query(`
            ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old";
            CREATE TYPE "public"."users_role_enum" AS ENUM('BASIC', 'ADMIN');
            ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::text::"public"."users_role_enum";
            DROP TYPE "public"."users_role_enum_old";
        `);
    }
} 
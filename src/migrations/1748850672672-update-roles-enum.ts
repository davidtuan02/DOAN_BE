import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateRolesEnum1748850672672 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Xóa giá trị mặc định trước
        await queryRunner.query(`
            ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
        `);

        // Tạo enum mới với các role mới
        await queryRunner.query(`
            ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old";
            CREATE TYPE "public"."users_role_enum" AS ENUM('MANAGER', 'LEADER', 'MEMBER');
            ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING 
                CASE 
                    WHEN role::text = 'BASIC' THEN 'MEMBER'::text
                    WHEN role::text = 'ADMIN' THEN 'MANAGER'::text
                    WHEN role::text = 'LEADER' THEN 'LEADER'::text
                END::text::"public"."users_role_enum";
            DROP TYPE "public"."users_role_enum_old";
        `);

        // Thêm lại giá trị mặc định
        await queryRunner.query(`
            ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'MEMBER'::text::"public"."users_role_enum";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa giá trị mặc định trước
        await queryRunner.query(`
            ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
        `);

        // Khôi phục lại enum cũ
        await queryRunner.query(`
            ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old";
            CREATE TYPE "public"."users_role_enum" AS ENUM('BASIC', 'ADMIN', 'LEADER');
            ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING 
                CASE 
                    WHEN role::text = 'MEMBER' THEN 'BASIC'::text
                    WHEN role::text = 'MANAGER' THEN 'ADMIN'::text
                    WHEN role::text = 'LEADER' THEN 'LEADER'::text
                END::text::"public"."users_role_enum";
            DROP TYPE "public"."users_role_enum_old";
        `);

        // Thêm lại giá trị mặc định
        await queryRunner.query(`
            ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'BASIC'::text::"public"."users_role_enum";
        `);
    }
} 
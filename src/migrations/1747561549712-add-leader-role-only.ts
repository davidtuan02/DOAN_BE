import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLeaderRoleOnly1747561549712 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Chỉ thêm role LEADER vào enum hiện tại
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_enum 
                    WHERE enumlabel = 'LEADER' 
                    AND enumtypid = (
                        SELECT oid 
                        FROM pg_type 
                        WHERE typname = 'users_role_enum'
                    )
                ) THEN
                    ALTER TYPE "public"."users_role_enum" ADD VALUE 'LEADER';
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Không thể xóa giá trị enum trong PostgreSQL
        // Nên để trống
    }
} 
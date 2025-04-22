import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1745358419120 implements MigrationInterface {
    name = 'Init1745358419120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "goals" DROP COLUMN "timeframe"`);
        await queryRunner.query(`DROP TYPE "public"."goals_timeframe_enum"`);
        await queryRunner.query(`ALTER TABLE "goals" DROP COLUMN "year"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "goals" ADD "year" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`CREATE TYPE "public"."goals_timeframe_enum" AS ENUM('Q1', 'Q2', 'Q3', 'Q4', 'YEARLY', 'CUSTOM')`);
        await queryRunner.query(`ALTER TABLE "goals" ADD "timeframe" "public"."goals_timeframe_enum" NOT NULL DEFAULT 'Q1'`);
    }

}

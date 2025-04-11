import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1744351334731 implements MigrationInterface {
    name = 'Init1744351334731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_filters" ADD "description" character varying`);
        await queryRunner.query(`ALTER TABLE "custom_filters" ADD "is_starred" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_filters" DROP COLUMN "is_starred"`);
        await queryRunner.query(`ALTER TABLE "custom_filters" DROP COLUMN "description"`);
    }

}

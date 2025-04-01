import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1743530983186 implements MigrationInterface {
    name = 'Init1743530983186'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" ADD "start_date" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "start_date"`);
    }

}
